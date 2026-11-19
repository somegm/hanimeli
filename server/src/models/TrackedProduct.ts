import { Schema, model } from 'mongoose';

const trackedProductSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    productId: { type: String, required: true },
    targetPrice: { type: Number, required: true },
    alertEnabled: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },
    lastChecked: { type: String, required: true },
  },
  { timestamps: true },
);

trackedProductSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const TrackedProductModel = model('TrackedProduct', trackedProductSchema);
