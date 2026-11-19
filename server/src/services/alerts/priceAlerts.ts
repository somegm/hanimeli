import { ProductModel } from '../../models/Product';
import { PriceHistoryModel } from '../../models/PriceHistory';
import { TrackedProductModel } from '../../models/TrackedProduct';
import { UserModel } from '../../models/User';
import { sendExpiryPush, sendPriceDropPush } from '../push/expoPush';

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function recordPriceSnapshots(): Promise<void> {
  const products = await ProductModel.find().lean();
  const recordedAt = new Date().toISOString();

  const entries = products.flatMap((product) =>
    product.prices.map((price) => ({
      productId: product.externalId,
      storeName: price.storeName,
      price: price.price,
      recordedAt,
    })),
  );

  if (entries.length > 0) {
    await PriceHistoryModel.insertMany(entries, { ordered: false });
  }
}

export async function checkPriceAlerts(): Promise<number> {
  const tracking = await TrackedProductModel.find({ alertEnabled: true }).lean();
  if (tracking.length === 0) {
    return 0;
  }

  const products = await ProductModel.find().lean();
  const productMap = new Map(products.map((p) => [p.externalId, p]));
  const users = await UserModel.find({ expoPushToken: { $exists: true, $ne: '' } }).lean();
  const userTokenMap = new Map(users.map((u) => [u.externalId, u.expoPushToken]));

  let sentCount = 0;

  for (const track of tracking) {
    const product = productMap.get(track.productId);
    if (!product) {
      continue;
    }

    const cheapest = [...product.prices].sort((a, b) => a.price - b.price)[0];
    if (!cheapest || cheapest.price > track.targetPrice) {
      continue;
    }

    const token = userTokenMap.get(track.userId);
    if (!token) {
      continue;
    }

    const sent = await sendPriceDropPush(
      token,
      product.productName,
      cheapest.price,
      cheapest.storeName,
    );

    if (sent) {
      sentCount += 1;
      await TrackedProductModel.updateOne(
        { _id: track._id },
        { lastChecked: new Date().toISOString() },
      );
    }
  }

  return sentCount;
}

export async function checkPantryExpiryAlerts(): Promise<number> {
  const users = await UserModel.find({
    expoPushToken: { $exists: true, $ne: '' },
    'pantryItems.0': { $exists: true },
  }).lean();

  let sentCount = 0;
  const now = new Date();

  for (const user of users) {
    if (!user.expoPushToken) {
      continue;
    }

    for (const item of user.pantryItems) {
      if (!item.expiresAt) {
        continue;
      }

      const expiry = new Date(item.expiresAt);
      const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysLeft <= 2) {
        const sent = await sendExpiryPush(user.expoPushToken, item.name, daysLeft);
        if (sent) {
          sentCount += 1;
        }
      }
    }
  }

  return sentCount;
}

export function getPriceHistoryCutoff(days = 30): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export async function getProductPriceHistory(productId: string, days = 30) {
  const cutoff = getPriceHistoryCutoff(days);
  return PriceHistoryModel.find({
    productId,
    recordedAt: { $gte: cutoff },
  })
    .sort({ recordedAt: 1 })
    .lean();
}

export { todayIsoDate };
