import type { StoreName } from '@/types/tracking';

export interface PriceHistoryPoint {
  date: string;
  price: number;
}

export interface ProductDetail {
  id: string;
  productName: string;
  unit: string;
  category: string;
  imageUrl: string;
  prices: {
    storeName: StoreName;
    price: number;
    inStock: boolean;
    lastUpdated: string;
  }[];
  priceHistory: Record<string, PriceHistoryPoint[]>;
}

export interface RouteStop {
  storeName: string;
  reason: string;
  itemCount: number;
  mapsUrl: string;
}
