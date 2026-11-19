import { Router } from 'express';

import { ProductModel } from '../models/Product';
import { TrackedProductModel } from '../models/TrackedProduct';
import { getUserId } from '../utils/auth';
import { sendError } from '../utils/response';

export const trackingRouter = Router();

interface CheapestPrice {
  storeName: string;
  price: number;
  lastUpdated: string;
}

function getCheapestPrice(
  prices: { storeName: string; price: number; lastUpdated: string }[],
): CheapestPrice {
  return [...prices].sort((a, b) => a.price - b.price)[0];
}

trackingRouter.get('/', async (req, res) => {
  const userId = getUserId(req);
  const products = await ProductModel.find().lean();
  const tracking = await TrackedProductModel.find({ userId }).lean();
  const trackingMap = new Map(tracking.map((item) => [item.productId, item]));

  const trackedProducts = products.map((product) => {
    const cheapest = getCheapestPrice(product.prices);
    const prefs = trackingMap.get(product.externalId);

    return {
      id: product.externalId,
      productName: product.productName,
      category: product.category,
      imageUrl: product.imageUrl,
      currentPrice: cheapest.price,
      targetPrice: prefs?.targetPrice ?? Math.round(cheapest.price * 0.9 * 10) / 10,
      storeName: cheapest.storeName,
      alertEnabled: prefs?.alertEnabled ?? false,
      isFavorite: prefs?.isFavorite ?? false,
      lastChecked: prefs?.lastChecked ?? cheapest.lastUpdated,
    };
  });

  res.json(trackedProducts);
});

trackingRouter.patch('/:productId/alert', async (req, res) => {
  const userId = getUserId(req);
  const { productId } = req.params;
  const product = await ProductModel.findOne({ externalId: productId }).lean();

  if (!product) {
    sendError(res, 404, 'Product not found');
    return;
  }

  const cheapest = getCheapestPrice(product.prices);
  const existing = await TrackedProductModel.findOne({ userId, productId });

  if (existing) {
    existing.alertEnabled = !existing.alertEnabled;
    existing.lastChecked = new Date().toISOString();
    await existing.save();
    res.json({ alertEnabled: existing.alertEnabled });
    return;
  }

  const created = await TrackedProductModel.create({
    userId,
    productId,
    targetPrice: Math.round(cheapest.price * 0.9 * 10) / 10,
    alertEnabled: true,
    lastChecked: new Date().toISOString(),
  });

  res.json({ alertEnabled: created.alertEnabled });
});

trackingRouter.patch('/:productId/favorite', async (req, res) => {
  const userId = getUserId(req);
  const { productId } = req.params;
  const product = await ProductModel.findOne({ externalId: productId }).lean();

  if (!product) {
    sendError(res, 404, 'Product not found');
    return;
  }

  const cheapest = getCheapestPrice(product.prices);
  const existing = await TrackedProductModel.findOne({ userId, productId });

  if (existing) {
    existing.isFavorite = !existing.isFavorite;
    existing.lastChecked = new Date().toISOString();
    await existing.save();
    res.json({ isFavorite: existing.isFavorite });
    return;
  }

  const created = await TrackedProductModel.create({
    userId,
    productId,
    targetPrice: Math.round(cheapest.price * 0.9 * 10) / 10,
    alertEnabled: false,
    isFavorite: true,
    lastChecked: new Date().toISOString(),
  });

  res.json({ isFavorite: created.isFavorite });
});

trackingRouter.patch('/:productId/target-price', async (req, res) => {
  const userId = getUserId(req);
  const { productId } = req.params;
  const targetPrice = Number(req.body?.targetPrice);

  if (!Number.isFinite(targetPrice) || targetPrice <= 0) {
    sendError(res, 400, 'Valid targetPrice is required');
    return;
  }

  const product = await ProductModel.findOne({ externalId: productId }).lean();
  if (!product) {
    sendError(res, 404, 'Product not found');
    return;
  }

  const updated = await TrackedProductModel.findOneAndUpdate(
    { userId, productId },
    {
      userId,
      productId,
      targetPrice,
      alertEnabled: true,
      lastChecked: new Date().toISOString(),
    },
    { upsert: true, new: true },
  );

  res.json({ targetPrice: updated.targetPrice });
});

trackingRouter.post('/:productId/simulate-drop', async (req, res) => {
  const userId = getUserId(req);
  const { productId } = req.params;
  const product = await ProductModel.findOne({ externalId: productId }).lean();

  if (!product) {
    sendError(res, 404, 'Product not found');
    return;
  }

  const cheapest = getCheapestPrice(product.prices);
  const newPrice = Math.round(cheapest.price * 0.85 * 10) / 10;

  const prefs = await TrackedProductModel.findOneAndUpdate(
    { userId, productId },
    {
      userId,
      productId,
      targetPrice: Math.round(cheapest.price * 0.9 * 10) / 10,
      alertEnabled: true,
      lastChecked: new Date().toISOString(),
    },
    { upsert: true, new: true },
  );

  const shouldAlert = prefs.alertEnabled && newPrice <= prefs.targetPrice;

  res.json({
    currentPrice: newPrice,
    shouldAlert,
    productName: product.productName,
    storeName: cheapest.storeName,
  });
});
