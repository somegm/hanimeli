import { randomUUID } from 'crypto';

import { PantryRecipeTemplateModel } from '../../models/PantryRecipeTemplate';
import type { GeneratedRecipe, PantryIngredientInput } from '../recipeAi/types';

const RECIPE_COUNT = 3;
const MIN_MATCH_COUNT = 2;

interface TemplateDoc {
  externalId: string;
  title: string;
  description: string;
  prepTimeMinutes: number;
  ingredients: string[];
  steps: string[];
  matchedIngredients: string[];
}

function scoreTemplate(template: TemplateDoc, selectedIds: Set<string>): number {
  const matched = template.matchedIngredients.filter((id) => selectedIds.has(id));
  if (matched.length < MIN_MATCH_COUNT) {
    return 0;
  }

  const coverage = matched.length / template.matchedIngredients.length;
  const userCoverage = matched.length / selectedIds.size;
  return coverage * 0.6 + userCoverage * 0.4;
}

function mapToGeneratedRecipe(
  template: TemplateDoc,
  pantryIngredients: PantryIngredientInput[],
): GeneratedRecipe {
  const nameToId = new Map(pantryIngredients.map((item) => [item.id, item.id]));
  const matchedIngredients = template.matchedIngredients.filter((id) => nameToId.has(id));

  return {
    id: `match-${template.externalId}-${randomUUID().slice(0, 8)}`,
    title: template.title,
    description: template.description,
    prepTimeMinutes: template.prepTimeMinutes,
    ingredients: template.ingredients,
    steps: template.steps,
    matchedIngredients,
  };
}

export async function matchPantryRecipes(
  ingredients: PantryIngredientInput[],
): Promise<GeneratedRecipe[]> {
  if (ingredients.length < MIN_MATCH_COUNT) {
    throw new Error('INSUFFICIENT_INGREDIENTS');
  }

  const selectedIds = new Set(ingredients.map((item) => item.id));
  const templates = await PantryRecipeTemplateModel.find().lean();

  const scored = templates
    .map((template) => ({
      template: template as TemplateDoc,
      score: scoreTemplate(template as TemplateDoc, selectedIds),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    throw new Error('NO_MATCHING_RECIPES');
  }

  return scored
    .slice(0, RECIPE_COUNT)
    .map((item) => mapToGeneratedRecipe(item.template, ingredients));
}
