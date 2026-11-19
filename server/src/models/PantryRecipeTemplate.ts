import { Schema, model } from 'mongoose';

const pantryRecipeTemplateSchema = new Schema(
  {
    externalId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    prepTimeMinutes: { type: Number, required: true },
    ingredients: { type: [String], required: true },
    steps: { type: [String], required: true },
    matchedIngredients: { type: [String], required: true },
  },
  { timestamps: true },
);

export const PantryRecipeTemplateModel = model('PantryRecipeTemplate', pantryRecipeTemplateSchema);
