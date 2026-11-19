import { Schema, model } from 'mongoose';

const locationSchema = new Schema(
  {
    city: { type: String, required: true },
    district: { type: String },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    label: { type: String, required: true },
  },
  { _id: false },
);

const dietProfileSchema = new Schema(
  {
    vegetarian: { type: Boolean, default: false },
    vegan: { type: Boolean, default: false },
    glutenFree: { type: Boolean, default: false },
    lactoseFree: { type: Boolean, default: false },
    allergies: { type: [String], default: [] },
  },
  { _id: false },
);

const householdSchema = new Schema(
  {
    adultCount: { type: Number, default: 2 },
    childAges: { type: [Number], default: [] },
    dailyCalorieTarget: { type: Number, default: 2000 },
  },
  { _id: false },
);

const pantryItemSchema = new Schema(
  {
    ingredientId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: String, default: '1' },
    expiresAt: { type: String, default: null },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    externalId: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, required: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    location: { type: locationSchema },
    expoPushToken: { type: String },
    dietProfile: { type: dietProfileSchema, default: () => ({}) },
    household: { type: householdSchema, default: () => ({}) },
    pantryItems: { type: [pantryItemSchema], default: [] },
    favoriteRecipeIds: { type: [String], default: [] },
    cookedRecipeIds: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const UserModel = model('User', userSchema);
