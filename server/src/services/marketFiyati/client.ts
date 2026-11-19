import { MARKET_FIYATI_BASE_URL } from './constants';
import type { MarketFiyatiDepot, MarketFiyatiSearchResponse } from './types';

const REQUEST_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Origin: 'https://marketfiyati.org.tr',
  Referer: 'https://marketfiyati.org.tr/',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
};

async function postJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${MARKET_FIYATI_BASE_URL}${path}`, {
    method: 'POST',
    headers: REQUEST_HEADERS,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Market Fiyatı API hatası (${response.status}): ${path}`);
  }

  return (await response.json()) as T;
}

export async function fetchNearestDepots(
  latitude: number,
  longitude: number,
  distance: number,
): Promise<MarketFiyatiDepot[]> {
  const depots = await postJson<MarketFiyatiDepot[]>('/nearest', {
    latitude,
    longitude,
    distance,
  });

  return Array.isArray(depots) ? depots : [];
}

export async function searchProducts(params: {
  keywords: string;
  depots: string[];
  latitude: number;
  longitude: number;
  distance: number;
  page?: number;
  size?: number;
}): Promise<MarketFiyatiSearchResponse> {
  return postJson<MarketFiyatiSearchResponse>('/search', {
    keywords: params.keywords,
    pages: params.page ?? 0,
    size: params.size ?? 30,
    depots: params.depots,
    latitude: params.latitude,
    longitude: params.longitude,
    distance: params.distance,
  });
}
