import { Schema, model } from 'mongoose';

const priceHistorySchema = new Schema(
  {
    productId: { type: String, required: true, index: true },
    storeName: { type: String, required: true },
    price: { type: Number, required: true },
    recordedAt: { type: String, required: true, index: true },
  },
  { timestamps: true },
);

priceHistorySchema.index({ productId: 1, recordedAt: -1 });

export const PriceHistoryModel = model('PriceHistory', priceHistorySchema);
