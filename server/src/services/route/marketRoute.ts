import { DiscountModel } from '../../models/Discount';
import { ProductModel } from '../../models/Product';

const STORE_COORDS: Record<string, { lat: number; lng: number }> = {
  BIM: { lat: 39.97, lng: 32.86 },
  Şok: { lat: 39.975, lng: 32.865 },
  A101: { lat: 39.968, lng: 32.855 },
  Migros: { lat: 39.962, lng: 32.87 },
};

export interface RouteStop {
  storeName: string;
  reason: string;
  itemCount: number;
  mapsUrl: string;
}

export async function suggestMarketRoute(
  listItems: string[],
  userLat: number,
  userLng: number,
): Promise<RouteStop[]> {
  const [products, discounts] = await Promise.all([
    ProductModel.find().lean(),
    DiscountModel.find().lean(),
  ]);

  const storeScores = new Map<string, { items: Set<string>; discountCount: number }>();

  for (const store of Object.keys(STORE_COORDS)) {
    storeScores.set(store, { items: new Set(), discountCount: 0 });
  }

  for (const listItem of listItems) {
    const keyword = listItem.toLowerCase();
    const product = products.find((p) => p.productName.toLowerCase().includes(keyword));
    if (product) {
      const cheapest = [...product.prices].sort((a, b) => a.price - b.price)[0];
      const entry = storeScores.get(cheapest.storeName);
      entry?.items.add(listItem);
    }
  }

  for (const discount of discounts) {
    const matchesList = listItems.some((item) =>
      discount.productName.toLowerCase().includes(item.toLowerCase().split(' ')[0] ?? ''),
    );
    if (matchesList) {
      const entry = storeScores.get(discount.storeName);
      if (entry) {
        entry.discountCount += 1;
      }
    }
  }

  const ranked = [...storeScores.entries()]
    .map(([storeName, data]) => ({
      storeName,
      itemCount: data.items.size,
      discountCount: data.discountCount,
      score: data.items.size * 2 + data.discountCount,
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return ranked.map((stop, index) => {
    const coords = STORE_COORDS[stop.storeName] ?? { lat: userLat, lng: userLng };
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${coords.lat},${coords.lng}&travelmode=driving`;

    return {
      storeName: stop.storeName,
      reason:
        stop.discountCount > 0
          ? `${stop.itemCount} listede ürün, ${stop.discountCount} indirim`
          : `${stop.itemCount} listede ürün en uygun`,
      itemCount: stop.itemCount,
      mapsUrl: index === 0 ? mapsUrl : mapsUrl,
    };
  });
}
