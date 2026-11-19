import { Schema, model } from 'mongoose';

const syncMetaSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    lastSyncedAt: { type: String, required: true },
    productCount: { type: Number, default: 0 },
    discountCount: { type: Number, default: 0 },
    source: { type: String, required: true },
    status: { type: String, enum: ['success', 'error'], required: true },
    errorMessage: { type: String },
  },
  { timestamps: true },
);

export const SyncMetaModel = model('SyncMeta', syncMetaSchema);
