import { apiFetch } from '@/services/api/client';
import type { Recipe, RecipeDetail } from '@/types/recipe';
import type { Discount } from '@/types/discount';
import type { ProductDetail } from '@/types/product';

export function fetchRecipes(): Promise<Recipe[]> {
  return apiFetch<Recipe[]>('/api/recipes');
}

export function fetchPopularRecipes(): Promise<Recipe[]> {
  return apiFetch<Recipe[]>('/api/recipes/popular');
}

export function fetchDailyRecipes(): Promise<Recipe[]> {
  return apiFetch<Recipe[]>('/api/recipes/daily');
}

export function fetchRecipeDetail(recipeId: string): Promise<RecipeDetail> {
  return apiFetch<RecipeDetail>(`/api/recipes/${recipeId}`);
}

export function toggleRecipeFavorite(recipeId: string): Promise<{ isFavorite: boolean }> {
  return apiFetch(`/api/recipes/${recipeId}/favorite`, { method: 'PATCH', auth: true });
}

export function markRecipeCooked(recipeId: string): Promise<{ cookCount: number }> {
  return apiFetch(`/api/recipes/${recipeId}/cooked`, { method: 'POST', auth: true });
}

export function rateRecipe(
  recipeId: string,
  rating: number,
): Promise<{ averageRating: number; ratingCount: number }> {
  return apiFetch(`/api/recipes/${recipeId}/rate`, {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ rating }),
  });
}

export function fetchDiscounts(): Promise<Discount[]> {
  return apiFetch<Discount[]>('/api/discounts');
}

export function fetchDiscountDetail(discountId: string): Promise<Discount> {
  return apiFetch<Discount>(`/api/discounts/${discountId}`);
}

export function fetchProductDetail(productId: string): Promise<ProductDetail> {
  return apiFetch<ProductDetail>(`/api/products/${productId}`);
}
