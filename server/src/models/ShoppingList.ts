import { Schema, model } from 'mongoose';

const sharedMemberSchema = new Schema(
  {
    externalId: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['owner', 'member'], required: true },
    avatarColor: { type: String, required: true },
  },
  { _id: false },
);

const shoppingListItemSchema = new Schema(
  {
    externalId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: String, required: true },
    category: { type: String, required: true },
    isChecked: { type: Boolean, default: false },
    addedBy: { type: String, required: true },
  },
  { _id: false },
);

const shoppingListSchema = new Schema(
  {
    externalId: { type: String, required: true, unique: true },
    ownerId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    shareCode: { type: String, required: true, unique: true },
    members: { type: [sharedMemberSchema], required: true },
    items: { type: [shoppingListItemSchema], default: [] },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { timestamps: false },
);

export const ShoppingListModel = model('ShoppingList', shoppingListSchema);
