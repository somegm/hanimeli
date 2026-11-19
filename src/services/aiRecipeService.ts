import { generatePantryRecipes } from '@/services/api/contentApi';
import type { AIGeneratedRecipe } from '@/types/pantry';

export async function generateRecipesFromPantry(
  ingredientIds: string[],
): Promise<AIGeneratedRecipe[]> {
  if (ingredientIds.length < 2) {
    return [];
  }

  const data = await generatePantryRecipes(ingredientIds);
  return data.recipes;
}
