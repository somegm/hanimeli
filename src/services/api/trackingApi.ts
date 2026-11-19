import { apiFetch } from '@/services/api/client';
import type { ComparisonProduct, TrackedProduct } from '@/types/tracking';

export function fetchProducts(): Promise<ComparisonProduct[]> {
  return apiFetch<ComparisonProduct[]>('/api/products');
}

export function fetchTrackedProducts(): Promise<TrackedProduct[]> {
  return apiFetch<TrackedProduct[]>('/api/tracking', { auth: true });
}

export function togglePriceAlert(productId: string): Promise<{ alertEnabled: boolean }> {
  return apiFetch<{ alertEnabled: boolean }>(`/api/tracking/${productId}/alert`, {
    method: 'PATCH',
    auth: true,
  });
}

export function toggleFavorite(productId: string): Promise<{ isFavorite: boolean }> {
  return apiFetch<{ isFavorite: boolean }>(`/api/tracking/${productId}/favorite`, {
    method: 'PATCH',
    auth: true,
  });
}

export function updateTargetPrice(
  productId: string,
  targetPrice: number,
): Promise<{ targetPrice: number }> {
  return apiFetch<{ targetPrice: number }>(`/api/tracking/${productId}/target-price`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify({ targetPrice }),
  });
}

export function simulatePriceDrop(productId: string): Promise<{
  currentPrice: number;
  shouldAlert: boolean;
  productName: string;
  storeName: string;
}> {
  return apiFetch(`/api/tracking/${productId}/simulate-drop`, {
    method: 'POST',
    auth: true,
  });
}
