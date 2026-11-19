import { apiFetch } from '@/services/api/client';
import type { WeeklyMenu, ShoppingListIngredient } from '@/types/menu';
import type { CookingTip } from '@/types/tip';
import type { TipCategory } from '@/types/tip';
import type { PantryIngredient, AIGeneratedRecipe } from '@/types/pantry';

export function fetchCookingTips(category?: TipCategory | 'all'): Promise<CookingTip[]> {
  const query = category && category !== 'all' ? `?category=${category}` : '';
  return apiFetch<CookingTip[]>(`/api/tips${query}`);
}

export function fetchPantryIngredients(): Promise<PantryIngredient[]> {
  return apiFetch<PantryIngredient[]>('/api/pantry/ingredients');
}

export function generatePantryRecipes(
  ingredientIds: string[],
): Promise<{ recipes: AIGeneratedRecipe[] }> {
  return apiFetch<{ recipes: AIGeneratedRecipe[] }>('/api/pantry/recipes', {
    method: 'POST',
    body: JSON.stringify({ ingredientIds }),
  });
}

export function fetchCurrentWeeklyMenu(): Promise<{
  menu: WeeklyMenu;
  shoppingIngredients: ShoppingListIngredient[];
}> {
  return apiFetch('/api/menus/current', { auth: true });
}

export function generateWeeklyMenu(): Promise<{
  menu: WeeklyMenu;
  shoppingIngredients: ShoppingListIngredient[];
  costEstimate: {
    items: { ingredient: string; cheapestStore: string; cheapestPrice: number; productName: string }[];
    storeTotals: { store: string; total: number }[];
  };
}> {
  return apiFetch('/api/menus/generate', { method: 'POST', auth: true });
}

export function estimateMenuCosts(ingredients: string[]): Promise<{
  items: { ingredient: string; cheapestStore: string; cheapestPrice: number; productName: string }[];
  storeTotals: { store: string; total: number }[];
}> {
  return apiFetch('/api/menus/estimate-costs', {
    method: 'POST',
    body: JSON.stringify({ ingredients }),
  });
}
