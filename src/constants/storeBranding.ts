import type { Discount } from '@/types/discount';

export type StoreBrandKey = 'BIM' | 'Şok' | 'A101' | 'Migros';

export const STORE_ORDER: StoreBrandKey[] = ['BIM', 'Şok', 'A101', 'Migros'];

export interface StoreBrand {
  key: StoreBrandKey;
  label: string;
  color: string;
  textColor: string;
  lightBg: string;
}

export const STORE_BRANDS: Record<StoreBrandKey, StoreBrand> = {
  BIM: {
    key: 'BIM',
    label: 'BİM',
    color: '#E30613',
    textColor: '#FFFFFF',
    lightBg: 'rgba(227, 6, 19, 0.14)',
  },
  Şok: {
    key: 'Şok',
    label: 'ŞOK',
    color: '#FFD100',
    textColor: '#1A1A1A',
    lightBg: 'rgba(255, 209, 0, 0.12)',
  },
  A101: {
    key: 'A101',
    label: 'A101',
    color: '#0066B3',
    textColor: '#FFFFFF',
    lightBg: 'rgba(0, 102, 179, 0.14)',
  },
  Migros: {
    key: 'Migros',
    label: 'Migros',
    color: '#F58220',
    textColor: '#FFFFFF',
    lightBg: 'rgba(245, 130, 32, 0.14)',
  },
};

export function getStoreBrand(storeName: string): StoreBrand {
  if (storeName in STORE_BRANDS) {
    return STORE_BRANDS[storeName as StoreBrandKey];
  }

  return {
    key: 'BIM',
    label: storeName,
    color: '#5D4037',
    textColor: '#FFFFFF',
    lightBg: 'rgba(93, 64, 55, 0.18)',
  };
}

export interface DiscountStoreGroup {
  storeKey: string;
  brand: StoreBrand;
  items: Discount[];
}

export function groupDiscountsByStore(discounts: Discount[]): DiscountStoreGroup[] {
  const buckets = new Map<string, Discount[]>();

  for (const discount of discounts) {
    const list = buckets.get(discount.storeName) ?? [];
    list.push(discount);
    buckets.set(discount.storeName, list);
  }

  const groups: DiscountStoreGroup[] = [];

  for (const storeKey of STORE_ORDER) {
    const items = buckets.get(storeKey);
    if (!items?.length) {
      continue;
    }

    groups.push({
      storeKey,
      brand: STORE_BRANDS[storeKey],
      items: [...items].sort((a, b) => b.discountPercent - a.discountPercent),
    });
    buckets.delete(storeKey);
  }

  for (const [storeKey, items] of buckets) {
    groups.push({
      storeKey,
      brand: getStoreBrand(storeKey),
      items: [...items].sort((a, b) => b.discountPercent - a.discountPercent),
    });
  }

  return groups;
}
