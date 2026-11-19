import { Schema, model } from 'mongoose';

const storePriceSchema = new Schema(
  {
    storeName: { type: String, enum: ['BIM', 'Şok', 'A101', 'Migros'], required: true },
    price: { type: Number, required: true },
    inStock: { type: Boolean, required: true },
    lastUpdated: { type: String, required: true },
  },
  { _id: false },
);

const productSchema = new Schema(
  {
    externalId: { type: String, required: true, unique: true },
    productName: { type: String, required: true },
    unit: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    prices: { type: [storePriceSchema], required: true },
  },
  { timestamps: true },
);

export const ProductModel = model('Product', productSchema);
