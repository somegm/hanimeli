import {
  deleteSecureItem,
  getSecureItem,
  setSecureItem,
} from '@/services/secureStorage';
import type { AuthUser } from '@/types/auth';

function createGuestUserId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export async function getGuestUserId(): Promise<string | null> {
  return getSecureItem('guestUserId');
}

export async function getOrCreateGuestUserId(): Promise<string> {
  const existing = await getSecureItem('guestUserId');
  if (existing) {
    return existing;
  }

  const guestUserId = createGuestUserId();
  await setSecureItem('guestUserId', guestUserId);
  return guestUserId;
}

export async function saveAuthSession(token: string, user: AuthUser): Promise<void> {
  await Promise.all([
    setSecureItem('authToken', token),
    setSecureItem('userId', user.id),
    setSecureItem('displayName', user.displayName),
    setSecureItem('userEmail', user.email ?? ''),
    deleteSecureItem('guestUserId'),
  ]);
}

export async function clearAuthSession(): Promise<void> {
  await Promise.all([
    deleteSecureItem('authToken'),
    deleteSecureItem('userId'),
    deleteSecureItem('displayName'),
    deleteSecureItem('userEmail'),
    deleteSecureItem('guestUserId'),
  ]);
}

export async function getStoredAuthToken(): Promise<string | null> {
  return getSecureItem('authToken');
}

export async function loadStoredAuthUser(): Promise<AuthUser | null> {
  const [token, userId, displayName, email] = await Promise.all([
    getSecureItem('authToken'),
    getSecureItem('userId'),
    getSecureItem('displayName'),
    getSecureItem('userEmail'),
  ]);

  if (!token || !userId || !displayName) {
    return null;
  }

  return {
    id: userId,
    displayName,
    email: email || null,
  };
}

export async function hasStoredSession(): Promise<boolean> {
  const [token, guestId] = await Promise.all([
    getSecureItem('authToken'),
    getSecureItem('guestUserId'),
  ]);
  return Boolean(token || guestId);
}
