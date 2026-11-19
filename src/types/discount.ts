export interface Discount {
  id: string;
  storeName: string;
  productName: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  validUntil: string;
  imageUrl: string;
  category: string;
}
