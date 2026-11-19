export type StoreName = 'BIM' | 'Şok' | 'A101' | 'Migros';

export interface TrackedProduct {
  id: string;
  productName: string;
  category: string;
  imageUrl: string;
  currentPrice: number;
  targetPrice: number;
  storeName: StoreName;
  alertEnabled: boolean;
  isFavorite: boolean;
  lastChecked: string;
}

export interface StorePrice {
  storeName: StoreName;
  price: number;
  inStock: boolean;
  lastUpdated: string;
}

export interface ComparisonProduct {
  id: string;
  productName: string;
  unit: string;
  category: string;
  imageUrl: string;
  prices: StorePrice[];
}
