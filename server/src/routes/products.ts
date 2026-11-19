import { Router } from 'express';

import { ProductModel } from '../models/Product';
import { getProductPriceHistory } from '../services/alerts/priceAlerts';
import { mapExternalId } from '../utils/mappers';
import { sendError } from '../utils/response';

export const productsRouter = Router();

productsRouter.get('/', async (_req, res) => {
  const products = await ProductModel.find().lean();
  res.json(products.map((product) => mapExternalId(product)));
});

productsRouter.get('/:productId', async (req, res) => {
  const product = await ProductModel.findOne({ externalId: req.params.productId }).lean();

  if (!product) {
    sendError(res, 404, 'Ürün bulunamadı');
    return;
  }

  const priceHistory = await getProductPriceHistory(req.params.productId, 30);

  const historyByStore = new Map<string, { date: string; price: number }[]>();
  for (const entry of priceHistory) {
    const storeHistory = historyByStore.get(entry.storeName) ?? [];
    storeHistory.push({
      date: entry.recordedAt.slice(0, 10),
      price: entry.price,
    });
    historyByStore.set(entry.storeName, storeHistory);
  }

  res.json({
    ...mapExternalId(product),
    priceHistory: Object.fromEntries(historyByStore),
  });
});
