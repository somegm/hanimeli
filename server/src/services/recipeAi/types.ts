export interface PantryIngredientInput {
  id: string;
  name: string;
}

export interface RawAiRecipe {
  title: string;
  description: string;
  prepTimeMinutes: number;
  ingredients: string[];
  steps: string[];
  usedPantryIngredients: string[];
}

export interface AiRecipeResponse {
  recipes: RawAiRecipe[];
}

export interface GeneratedRecipe {
  id: string;
  title: string;
  description: string;
  prepTimeMinutes: number;
  ingredients: string[];
  steps: string[];
  matchedIngredients: string[];
}
