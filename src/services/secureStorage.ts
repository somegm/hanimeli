import * as SecureStore from 'expo-secure-store';

const SECURE_KEYS = {
  authToken: 'auth_token',
  refreshToken: 'refresh_token',
  guestUserId: 'guest_user_id',
  userId: 'user_id',
  displayName: 'display_name',
  userEmail: 'user_email',
} as const;

type SecureKey = keyof typeof SECURE_KEYS;

export async function getSecureItem(key: SecureKey): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SECURE_KEYS[key]);
  } catch {
    return null;
  }
}

export async function setSecureItem(key: SecureKey, value: string): Promise<boolean> {
  try {
    await SecureStore.setItemAsync(SECURE_KEYS[key], value);
    return true;
  } catch {
    return false;
  }
}

export async function deleteSecureItem(key: SecureKey): Promise<boolean> {
  try {
    await SecureStore.deleteItemAsync(SECURE_KEYS[key]);
    return true;
  } catch {
    return false;
  }
}
