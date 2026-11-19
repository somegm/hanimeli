import { randomUUID } from 'crypto';

import { DiscountModel } from '../../models/Discount';
import { PantryRecipeTemplateModel } from '../../models/PantryRecipeTemplate';
import { ProductModel } from '../../models/Product';
import { RecipeModel } from '../../models/Recipe';
import { WeeklyMenuModel } from '../../models/WeeklyMenu';
import type { UserDocument } from './types';

const WEEK_DAYS = [
  'pazartesi',
  'sali',
  'carsamba',
  'persembe',
  'cuma',
  'cumartesi',
  'pazar',
] as const;

const DAY_LABELS: Record<(typeof WEEK_DAYS)[number], string> = {
  pazartesi: 'Pazartesi',
  sali: 'Salı',
  carsamba: 'Çarşamba',
  persembe: 'Perşembe',
  cuma: 'Cuma',
  cumartesi: 'Cumartesi',
  pazar: 'Pazar',
};

interface MenuCandidate {
  id: string;
  title: string;
  ingredients: string[];
  matchedIngredientIds: string[];
  category: string;
}

function extractDiscountKeywords(discounts: { productName: string }[]): string[] {
  const keywords = new Set<string>();
  for (const discount of discounts) {
    const words = discount.productName.toLowerCase().split(/\s+/);
    for (const word of words) {
      if (word.length >= 3) {
        keywords.add(word);
      }
    }
  }
  return [...keywords];
}

function passesDietFilter(candidate: MenuCandidate, diet: UserDocument['dietProfile']): boolean {
  const title = candidate.title.toLowerCase();
  if (diet.vegetarian && /tavuk|kıyma|et|balık/.test(title)) {
    return false;
  }
  if (diet.vegan && /tavuk|kıyma|et|balık|yumurta|peynir|krema|süt/.test(title)) {
    return false;
  }
  if (diet.lactoseFree && /peynir|krema|süt|yoğurt/.test(title)) {
    return false;
  }
  return true;
}

function scoreCandidate(
  candidate: MenuCandidate,
  pantryIds: Set<string>,
  discountKeywords: string[],
  usedCategories: Set<string>,
): number {
  const pantryOverlap = candidate.matchedIngredientIds.filter((id) => pantryIds.has(id)).length;
  const discountBonus = candidate.ingredients.some((ing) =>
    discountKeywords.some((kw) => ing.toLowerCase().includes(kw)),
  )
    ? 0.25
    : 0;
  const diversityPenalty = usedCategories.has(candidate.category) ? -0.3 : 0;
  return pantryOverlap * 0.4 + discountBonus + diversityPenalty;
}

function buildShoppingIngredients(candidates: MenuCandidate[]) {
  const ingredientSet = new Map<string, { name: string; quantity: string; category: string }>();

  for (const candidate of candidates) {
    for (const ingredient of candidate.ingredients) {
      const key = ingredient.toLowerCase();
      if (!ingredientSet.has(key)) {
        ingredientSet.set(key, {
          name: ingredient,
          quantity: '1',
          category: candidate.category,
        });
      }
    }
  }

  return [...ingredientSet.values()];
}

export async function generatePersonalizedWeeklyMenu(user: UserDocument) {
  const [templates, recipes, discounts] = await Promise.all([
    PantryRecipeTemplateModel.find().lean(),
    RecipeModel.find().lean(),
    DiscountModel.find().sort({ discountPercent: -1 }).limit(50).lean(),
  ]);

  const diet = user.dietProfile ?? {
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    lactoseFree: false,
    allergies: [],
  };
  const pantryIds = new Set((user.pantryItems ?? []).map((item) => item.ingredientId));
  const discountKeywords = extractDiscountKeywords(discounts);

  const candidates: MenuCandidate[] = [
    ...templates.map((t) => ({
      id: t.externalId,
      title: t.title,
      ingredients: t.ingredients,
      matchedIngredientIds: t.matchedIngredients,
      category: 'Ana Yemek',
    })),
    ...recipes.map((r) => ({
      id: r.externalId,
      title: r.title,
      ingredients: r.ingredients ?? [],
      matchedIngredientIds: r.requiredIngredientIds ?? [],
      category: r.category,
    })),
    ].filter((c) => c.ingredients.length > 0 && passesDietFilter(c, diet));

  const selected: MenuCandidate[] = [];
  const usedCategories = new Set<string>();
  const usedIds = new Set<string>();

  for (const day of WEEK_DAYS) {
    const ranked = candidates
      .filter((c) => !usedIds.has(c.id))
      .map((c) => ({
        candidate: c,
        score: scoreCandidate(c, pantryIds, discountKeywords, usedCategories),
      }))
      .sort((a, b) => b.score - a.score);

    const pick = ranked[0]?.candidate ?? candidates.find((c) => !usedIds.has(c.id));
    if (!pick) {
      break;
    }

    selected.push(pick);
    usedIds.add(pick.id);
    usedCategories.add(pick.category);

    if (day === 'pazar') {
      break;
    }
  }

  while (selected.length < 7) {
    const fallback = candidates.find((c) => !usedIds.has(c.id));
    if (!fallback) {
      break;
    }
    selected.push(fallback);
    usedIds.add(fallback.id);
  }

  const now = new Date();
  const weekLabel = `${now.getDate()} - ${now.getDate() + 6} ${now.toLocaleString('tr-TR', { month: 'long', year: 'numeric' })}`;

  const days = WEEK_DAYS.map((day, index) => {
    const dinner = selected[index]?.title ?? 'Sebzeli güveç';
    return {
      day,
      dayLabel: DAY_LABELS[day],
      breakfast: index % 2 === 0 ? 'Peynirli omlet, zeytin' : 'Menemen, ekmek',
      lunch: index % 2 === 0 ? 'Mercimek çorbası, salata' : 'Ezogelin çorbası',
      dinner,
    };
  });

  const shoppingIngredients = buildShoppingIngredients(selected);

  await WeeklyMenuModel.updateMany({ isCurrent: true }, { isCurrent: false });

  const menu = await WeeklyMenuModel.create({
    externalId: `week-${randomUUID().slice(0, 8)}`,
    weekLabel,
    isCurrent: true,
    userId: user.externalId,
    days,
    shoppingIngredients,
  });

  return menu;
}

export async function estimateIngredientCosts(ingredientNames: string[]) {
  const products = await ProductModel.find().lean();
  const results: {
    ingredient: string;
    cheapestStore: string;
    cheapestPrice: number;
    productName: string;
  }[] = [];

  for (const ingredient of ingredientNames) {
    const keyword = ingredient.toLowerCase().split(/\s+/)[0] ?? ingredient;
    const match = products.find((p) => p.productName.toLowerCase().includes(keyword));
    if (!match) {
      continue;
    }

    const cheapest = [...match.prices].sort((a, b) => a.price - b.price)[0];
    results.push({
      ingredient,
      cheapestStore: cheapest.storeName,
      cheapestPrice: cheapest.price,
      productName: match.productName,
    });
  }

  const byStore = new Map<string, number>();
  for (const item of results) {
    byStore.set(item.cheapestStore, (byStore.get(item.cheapestStore) ?? 0) + item.cheapestPrice);
  }

  const storeTotals = [...byStore.entries()]
    .map(([store, total]) => ({ store, total }))
    .sort((a, b) => a.total - b.total);

  return { items: results, storeTotals };
}
