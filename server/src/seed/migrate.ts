import { RecipeModel } from '../models/Recipe';
import { RECIPE_DETAILS } from './recipeDetails';

export async function migrateRecipeDetails(): Promise<void> {
  const recipes = await RecipeModel.find().lean();

  for (const recipe of recipes) {
    const details = RECIPE_DETAILS[recipe.externalId];
    if (!details) {
      continue;
    }

    if (recipe.ingredients && recipe.ingredients.length > 0) {
      continue;
    }

    await RecipeModel.updateOne(
      { externalId: recipe.externalId },
      {
        ingredients: details.ingredients,
        steps: details.steps,
        nutrition: details.nutrition,
        dietTags: details.dietTags,
        requiredIngredientIds: details.requiredIngredientIds,
        averageRating: details.averageRating,
        ratingCount: details.ratingCount,
        cookCount: details.cookCount,
      },
    );
  }
}
