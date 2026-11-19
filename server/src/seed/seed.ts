import { connectDatabase } from '../config/database';
import { CookingTipModel } from '../models/CookingTip';
import { DiscountModel } from '../models/Discount';
import { PantryIngredientModel } from '../models/PantryIngredient';
import { PantryRecipeTemplateModel } from '../models/PantryRecipeTemplate';
import { ProductModel } from '../models/Product';
import { RecipeModel } from '../models/Recipe';
import { WeeklyMenuModel } from '../models/WeeklyMenu';
import {
  SEED_COOKING_TIPS,
  SEED_PANTRY_INGREDIENTS,
  SEED_PANTRY_RECIPES,
  SEED_RECIPES,
  SEED_WEEKLY_MENU,
} from './data';
import { RECIPE_DETAILS } from './recipeDetails';

function enrichRecipes() {
  return SEED_RECIPES.map((recipe) => {
    const details = RECIPE_DETAILS[recipe.externalId];
    if (!details) {
      return recipe;
    }
    return { ...recipe, ...details };
  });
}

export async function seedCatalog(): Promise<void> {
  await RecipeModel.deleteMany({});
  await DiscountModel.deleteMany({});
  await ProductModel.deleteMany({});
  await CookingTipModel.deleteMany({});
  await PantryIngredientModel.deleteMany({});
  await PantryRecipeTemplateModel.deleteMany({});
  await WeeklyMenuModel.deleteMany({});

  await RecipeModel.insertMany(enrichRecipes());
  await CookingTipModel.insertMany(SEED_COOKING_TIPS);
  await PantryIngredientModel.insertMany(SEED_PANTRY_INGREDIENTS);
  await PantryRecipeTemplateModel.insertMany(SEED_PANTRY_RECIPES);
  await WeeklyMenuModel.insertMany([SEED_WEEKLY_MENU]);
}
