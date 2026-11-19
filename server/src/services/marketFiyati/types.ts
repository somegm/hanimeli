export interface MarketFiyatiDepot {
  id: string;
  sellerName: string;
  marketName: string;
}

export interface MarketFiyatiDepotPrice {
  depotId: string;
  depotName: string;
  price: number;
  unitPrice: string;
  unitPriceValue: number;
  marketAdi: string;
  percentage: number;
  indexTime: string;
  discount: boolean;
  discountRatio: number | null;
  promotionText: string | null;
}

export interface MarketFiyatiProduct {
  id: string;
  title: string;
  brand: string;
  imageUrl: string;
  refinedVolumeOrWeight: string;
  main_category: string;
  menu_category: string;
  productDepotInfoList: MarketFiyatiDepotPrice[];
}

export interface MarketFiyatiSearchResponse {
  numberOfFound: number;
  content: MarketFiyatiProduct[];
}

export type StoreName = 'BIM' | 'Şok' | 'A101' | 'Migros';

export interface TrackedSearch {
  keyword: string;
  productKey: string;
  category: string;
}
