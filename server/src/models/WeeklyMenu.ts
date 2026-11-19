import { Schema, model } from 'mongoose';

const dayMenuSchema = new Schema(
  {
    day: {
      type: String,
      enum: ['pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi', 'pazar'],
      required: true,
    },
    dayLabel: { type: String, required: true },
    breakfast: { type: String, required: true },
    lunch: { type: String, required: true },
    dinner: { type: String, required: true },
  },
  { _id: false },
);

const shoppingIngredientSchema = new Schema(
  {
    name: { type: String, required: true },
    quantity: { type: String, required: true },
    category: { type: String, required: true },
  },
  { _id: false },
);

const weeklyMenuSchema = new Schema(
  {
    externalId: { type: String, required: true, unique: true },
    userId: { type: String, index: true },
    weekLabel: { type: String, required: true },
    isCurrent: { type: Boolean, default: false, index: true },
    days: { type: [dayMenuSchema], required: true },
    shoppingIngredients: { type: [shoppingIngredientSchema], required: true },
  },
  { timestamps: true },
);

export const WeeklyMenuModel = model('WeeklyMenu', weeklyMenuSchema);
