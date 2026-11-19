import { Schema, model } from 'mongoose';

const nutritionSchema = new Schema(
  {
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
  },
  { _id: false },
);

const recipeSchema = new Schema(
  {
    externalId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    prepTimeMinutes: { type: Number, required: true },
    servings: { type: Number, required: true },
    difficulty: { type: String, enum: ['kolay', 'orta', 'zor'], required: true },
    category: { type: String, required: true },
    isDailyPick: { type: Boolean, default: false },
    ingredients: { type: [String], default: [] },
    steps: { type: [String], default: [] },
    nutrition: { type: nutritionSchema },
    dietTags: { type: [String], default: [] },
    requiredIngredientIds: { type: [String], default: [] },
    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    cookCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const RecipeModel = model('Recipe', recipeSchema);
