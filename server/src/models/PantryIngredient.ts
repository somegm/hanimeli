import { Schema, model } from 'mongoose';

const pantryIngredientSchema = new Schema(
  {
    externalId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    emoji: { type: String, required: true },
  },
  { timestamps: true },
);

export const PantryIngredientModel = model('PantryIngredient', pantryIngredientSchema);
