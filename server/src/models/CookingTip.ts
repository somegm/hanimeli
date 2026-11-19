import { Schema, model } from 'mongoose';

const cookingTipSchema = new Schema(
  {
    externalId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ['artik-yemek', 'hamur', 'saklama', 'puf-nokta'],
      required: true,
    },
    categoryLabel: { type: String, required: true },
  },
  { timestamps: true },
);

export const CookingTipModel = model('CookingTip', cookingTipSchema);
