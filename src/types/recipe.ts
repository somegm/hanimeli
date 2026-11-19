export type RecipeDifficulty = 'kolay' | 'orta' | 'zor';

export interface RecipeNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  prepTimeMinutes: number;
  servings: number;
  difficulty: RecipeDifficulty;
  category: string;
  isDailyPick?: boolean;
  ingredients?: string[];
  steps?: string[];
  nutrition?: RecipeNutrition;
  dietTags?: string[];
  averageRating?: number;
  ratingCount?: number;
  cookCount?: number;
}

export interface RecipeDetail extends Recipe {
  ingredients: string[];
  steps: string[];
}
