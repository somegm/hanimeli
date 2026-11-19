export interface PantryIngredient {
  id: string;
  name: string;
  emoji: string;
}

export interface AIGeneratedRecipe {
  id: string;
  title: string;
  description: string;
  prepTimeMinutes: number;
  ingredients: string[];
  steps: string[];
  matchedIngredients: string[];
}
