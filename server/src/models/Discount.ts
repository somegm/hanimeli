import { Schema, model } from 'mongoose';

const discountSchema = new Schema(
  {
    externalId: { type: String, required: true, unique: true },
    storeName: { type: String, required: true },
    productName: { type: String, required: true },
    originalPrice: { type: Number, required: true },
    discountedPrice: { type: Number, required: true },
    discountPercent: { type: Number, required: true },
    validUntil: { type: String, required: true },
    imageUrl: { type: String, required: true },
    category: { type: String, required: true },
  },
  { timestamps: true },
);

export const DiscountModel = model('Discount', discountSchema);
