import { env } from '../../config/env';
import { DiscountModel } from '../../models/Discount';
import { ProductModel } from '../../models/Product';
import { SyncMetaModel } from '../../models/SyncMeta';
import { fetchNearestDepots, searchProducts } from './client';
import {
  DEFAULT_PLACEHOLDER_IMAGE,
  DISCOUNT_SEARCH_KEYWORDS,
  MARKET_NAME_MAP,
  TARGET_MARKETS,
  TRACKED_SEARCHES,
} from './constants';
import type {
  MarketFiyatiDepotPrice,
  MarketFiyatiProduct,
  StoreName,
} from './types';

const SYNC_META_KEY = 'market_data';
const SEARCH_DELAY_MS = 350;
const MIN_DISCOUNT_SPREAD_PERCENT = 8;

interface MarketPriceEntry {
  storeName: StoreName;
  price: number;
  inStock: boolean;
  lastUpdated: string;
}

interface ParsedProduct {
  externalId: string;
  productName: string;
  unit: string;
  category: string;
  imageUrl: string;
  prices: MarketPriceEntry[];
  sourceProductId: string;
}

interface ParsedDiscount {
  externalId: string;
  storeName: string;
  productName: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  validUntil: string;
  imageUrl: string;
  category: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toStoreName(marketAdi: string): StoreName | null {
  return MARKET_NAME_MAP[marketAdi.toLowerCase()] ?? null;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function validUntilDate(daysAhead = 7): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().slice(0, 10);
}

function parseIndexTime(indexTime: string): string {
  const parts = indexTime.split(' ')[0]?.split('.');
  if (!parts || parts.length !== 3) {
    return todayIsoDate();
  }
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function aggregateMarketPrices(
  depotList: MarketFiyatiDepotPrice[],
): MarketPriceEntry[] {
  const byMarket = new Map<StoreName, MarketPriceEntry>();

  for (const depot of depotList) {
    const storeName = toStoreName(depot.marketAdi);
    if (!storeName || !TARGET_MARKETS.includes(storeName)) {
      continue;
    }

    const existing = byMarket.get(storeName);
    if (!existing || depot.price < existing.price) {
      byMarket.set(storeName, {
        storeName,
        price: depot.price,
        inStock: true,
        lastUpdated: parseIndexTime(depot.indexTime),
      });
    }
  }

  for (const storeName of TARGET_MARKETS) {
    if (!byMarket.has(storeName)) {
      byMarket.set(storeName, {
        storeName,
        price: 0,
        inStock: false,
        lastUpdated: todayIsoDate(),
      });
    }
  }

  return TARGET_MARKETS.map((store) => byMarket.get(store)!);
}

function scoreProduct(product: MarketFiyatiProduct): number {
  const markets = new Set<StoreName>();
  for (const depot of product.productDepotInfoList) {
    const store = toStoreName(depot.marketAdi);
    if (store && TARGET_MARKETS.includes(store)) {
      markets.add(store);
    }
  }
  return markets.size;
}

function pickBestProduct(products: MarketFiyatiProduct[]): MarketFiyatiProduct | null {
  if (products.length === 0) {
    return null;
  }

  const ranked = [...products].sort((a, b) => scoreProduct(b) - scoreProduct(a));
  const best = ranked.find((product) => scoreProduct(product) >= 2);
  return best ?? ranked[0] ?? null;
}

function buildComparisonProduct(
  tracked: (typeof TRACKED_SEARCHES)[number],
  product: MarketFiyatiProduct,
): ParsedProduct {
  return {
    externalId: tracked.productKey,
    productName: product.title,
    unit: product.refinedVolumeOrWeight || '1 adet',
    category: product.menu_category || tracked.category,
    imageUrl: product.imageUrl || DEFAULT_PLACEHOLDER_IMAGE,
    prices: aggregateMarketPrices(product.productDepotInfoList),
    sourceProductId: product.id,
  };
}

function buildDiscountFromSpread(product: ParsedProduct): ParsedDiscount | null {
  const inStockPrices = product.prices.filter((entry) => entry.inStock && entry.price > 0);
  if (inStockPrices.length < 2) {
    return null;
  }

  const sorted = [...inStockPrices].sort((a, b) => a.price - b.price);
  const cheapest = sorted[0];
  const expensive = sorted[sorted.length - 1];

  const spreadPercent = Math.round(
    ((expensive.price - cheapest.price) / expensive.price) * 100,
  );

  if (spreadPercent < MIN_DISCOUNT_SPREAD_PERCENT) {
    return null;
  }

  return {
    externalId: `deal-${product.externalId}`,
    storeName: cheapest.storeName,
    productName: product.productName,
    originalPrice: expensive.price,
    discountedPrice: cheapest.price,
    discountPercent: spreadPercent,
    validUntil: validUntilDate(),
    imageUrl: product.imageUrl,
    category: product.category,
  };
}

function buildDiscountFromPromotion(
  product: MarketFiyatiProduct,
  category: string,
): ParsedDiscount | null {
  const promoDepot = product.productDepotInfoList.find(
    (depot) => depot.discount || (depot.discountRatio && depot.discountRatio > 0),
  );

  if (!promoDepot) {
    return null;
  }

  const storeName = toStoreName(promoDepot.marketAdi);
  if (!storeName) {
    return null;
  }

  const discountPercent = promoDepot.discountRatio
    ? Math.round(promoDepot.discountRatio)
    : Math.round(promoDepot.percentage);

  if (discountPercent <= 0) {
    return null;
  }

  const originalPrice =
    discountPercent > 0
      ? Math.round((promoDepot.price / (1 - discountPercent / 100)) * 100) / 100
      : promoDepot.price;

  return {
    externalId: `promo-${product.id}`,
    storeName,
    productName: product.title,
    originalPrice,
    discountedPrice: promoDepot.price,
    discountPercent,
    validUntil: validUntilDate(),
    imageUrl: product.imageUrl || DEFAULT_PLACEHOLDER_IMAGE,
    category: product.menu_category || category,
  };
}

function collectDiscountsFromProduct(
  item: MarketFiyatiProduct,
  discounts: Map<string, ParsedDiscount>,
  categoryFallback = 'Genel',
): void {
  const promoDeal = buildDiscountFromPromotion(item, item.menu_category || categoryFallback);
  if (promoDeal) {
    discounts.set(promoDeal.externalId, promoDeal);
  }

  const tempProduct: ParsedProduct = {
    externalId: `scan-${item.id}`,
    productName: item.title,
    unit: item.refinedVolumeOrWeight || '1 adet',
    category: item.menu_category || categoryFallback,
    imageUrl: item.imageUrl || DEFAULT_PLACEHOLDER_IMAGE,
    prices: aggregateMarketPrices(item.productDepotInfoList),
    sourceProductId: item.id,
  };

  const spreadDeal = buildDiscountFromSpread(tempProduct);
  if (spreadDeal) {
    discounts.set(spreadDeal.externalId, spreadDeal);
  }
}

async function scanKeywordForDiscounts(
  keyword: string,
  depotIds: string[],
  discounts: Map<string, ParsedDiscount>,
  latitude: number,
  longitude: number,
  distance: number,
): Promise<void> {
  const pageSize = env.marketDiscountSearchSize;
  const maxPages = env.marketDiscountSearchPages;

  for (let page = 0; page < maxPages; page += 1) {
    const response = await searchProducts({
      keywords: keyword,
      depots: depotIds,
      latitude,
      longitude,
      distance,
      page,
      size: pageSize,
    });

    if (response.content.length === 0) {
      break;
    }

    for (const item of response.content) {
      collectDiscountsFromProduct(item, discounts, keyword);
    }

    if (response.content.length < pageSize) {
      break;
    }

    await sleep(SEARCH_DELAY_MS);
  }
}

export interface SyncResult {
  productCount: number;
  discountCount: number;
  syncedAt: string;
}

export interface SyncLocation {
  latitude: number;
  longitude: number;
  distance?: number;
}

export async function syncMarketData(location?: SyncLocation): Promise<SyncResult> {
  const syncedAt = new Date().toISOString();
  const latitude = location?.latitude ?? env.marketLatitude;
  const longitude = location?.longitude ?? env.marketLongitude;
  const distance = location?.distance ?? env.marketDistance;

  const depotList = await fetchNearestDepots(latitude, longitude, distance);

  if (depotList.length === 0) {
    throw new Error('Yakın market bulunamadı. Konum ayarlarını kontrol edin.');
  }

  const depotIds = depotList.slice(0, 25).map((depot) => depot.id);
  const comparisonProducts: ParsedProduct[] = [];
  const discounts = new Map<string, ParsedDiscount>();

  for (const tracked of TRACKED_SEARCHES) {
    const response = await searchProducts({
      keywords: tracked.keyword,
      depots: depotIds,
      latitude,
      longitude,
      distance,
      size: 20,
    });

    const best = pickBestProduct(response.content);
    if (!best) {
      await sleep(SEARCH_DELAY_MS);
      continue;
    }

    const parsed = buildComparisonProduct(tracked, best);
    comparisonProducts.push(parsed);

    const spreadDeal = buildDiscountFromSpread(parsed);
    if (spreadDeal) {
      discounts.set(spreadDeal.externalId, spreadDeal);
    }

    const promoDeal = buildDiscountFromPromotion(best, tracked.category);
    if (promoDeal) {
      discounts.set(promoDeal.externalId, promoDeal);
    }

    await sleep(SEARCH_DELAY_MS);
  }

  for (const keyword of DISCOUNT_SEARCH_KEYWORDS) {
    await scanKeywordForDiscounts(keyword, depotIds, discounts, latitude, longitude, distance);
    await sleep(SEARCH_DELAY_MS);
  }

  const discountList = [...discounts.values()].sort(
    (a, b) => b.discountPercent - a.discountPercent,
  );

  const maxDiscounts = env.marketMaxDiscounts;
  const storedDiscounts =
    maxDiscounts > 0 ? discountList.slice(0, maxDiscounts) : discountList;

  await ProductModel.deleteMany({});
  await DiscountModel.deleteMany({});

  if (comparisonProducts.length > 0) {
    await ProductModel.insertMany(comparisonProducts);
  }

  if (storedDiscounts.length > 0) {
    await DiscountModel.insertMany(storedDiscounts);
  }

  await SyncMetaModel.findOneAndUpdate(
    { key: SYNC_META_KEY },
    {
      key: SYNC_META_KEY,
      lastSyncedAt: syncedAt,
      productCount: comparisonProducts.length,
      discountCount: storedDiscounts.length,
      source: 'marketfiyati.org.tr',
      status: 'success',
      errorMessage: undefined,
    },
    { upsert: true, new: true },
  );

  return {
    productCount: comparisonProducts.length,
    discountCount: storedDiscounts.length,
    syncedAt,
  };
}

export async function recordSyncError(message: string): Promise<void> {
  await SyncMetaModel.findOneAndUpdate(
    { key: SYNC_META_KEY },
    {
      key: SYNC_META_KEY,
      lastSyncedAt: new Date().toISOString(),
      source: 'marketfiyati.org.tr',
      status: 'error',
      errorMessage: message,
    },
    { upsert: true },
  );
}

export async function getSyncStatus() {
  return SyncMetaModel.findOne({ key: SYNC_META_KEY }).lean();
}
