import { apiFetch } from '@/services/api/client';
import type {
  DietProfile,
  HouseholdProfile,
  PantryItem,
  UserLocation,
  UserProfile,
} from '@/types/profile';

export function fetchUserProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>('/api/users/me', { auth: true });
}

export function updateUserLocation(location: UserLocation): Promise<{ location: UserLocation }> {
  return apiFetch('/api/users/me/location', {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify(location),
  });
}

export function registerPushToken(expoPushToken: string): Promise<{ registered: boolean }> {
  return apiFetch('/api/users/me/push-token', {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify({ expoPushToken }),
  });
}

export function updateDietProfile(dietProfile: DietProfile): Promise<{ dietProfile: DietProfile }> {
  return apiFetch('/api/users/me/diet', {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify(dietProfile),
  });
}

export function updateHouseholdProfile(
  household: HouseholdProfile,
): Promise<{ household: HouseholdProfile }> {
  return apiFetch('/api/users/me/household', {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify(household),
  });
}

export function fetchUserPantry(): Promise<{ items: PantryItem[] }> {
  return apiFetch('/api/users/me/pantry', { auth: true });
}

export function saveUserPantry(items: PantryItem[]): Promise<{ items: PantryItem[] }> {
  return apiFetch('/api/users/me/pantry', {
    method: 'PUT',
    auth: true,
    body: JSON.stringify({ items }),
  });
}

export function fetchExpiringPantry(): Promise<{ items: PantryItem[] }> {
  return apiFetch('/api/users/me/expiring-pantry', { auth: true });
}

export function fetchExpiringRecipes(): Promise<{
  recipes: import('@/types/pantry').AIGeneratedRecipe[];
  message?: string;
}> {
  return apiFetch('/api/users/me/expiring-recipes', { auth: true });
}

export function syncMarketForMyLocation(): Promise<{ message: string }> {
  return apiFetch('/api/sync/market-data/me', { method: 'POST', auth: true });
}

export function suggestMarketRoute(items: string[]): Promise<{ stops: import('@/types/product').RouteStop[] }> {
  return apiFetch('/api/route/suggest', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ items }),
  });
}
