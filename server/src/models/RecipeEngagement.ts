import { Schema, model } from 'mongoose';

const recipeEngagementSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    recipeId: { type: String, required: true, index: true },
    rating: { type: Number, min: 1, max: 5 },
    cookedAt: { type: String },
  },
  { timestamps: true },
);

recipeEngagementSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

export const RecipeEngagementModel = model('RecipeEngagement', recipeEngagementSchema);
