import { Platform } from 'react-native';

import { getGuestUserId, getStoredAuthToken } from '@/services/userSession';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function resolveApiUrl(rawUrl: string): string {
  const trimmed = rawUrl.replace(/\/$/, '');

  // Android emülatörde localhost bilgisayara değil emülatörün kendisine gider.
  if (Platform.OS === 'android') {
    return trimmed
      .replace('://localhost', '://10.0.2.2')
      .replace('://127.0.0.1', '://10.0.2.2');
  }

  return trimmed;
}

function getApiBaseUrl(): string {
  if (!API_URL) {
    throw new ApiError(0, 'EXPO_PUBLIC_API_URL tanımlı değil (.env dosyasını kontrol edin)');
  }
  return resolveApiUrl(API_URL);
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = false, headers, ...rest } = options;
  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers as Record<string, string>),
  };

  if (rest.body) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = await getStoredAuthToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    } else {
      const guestId = await getGuestUserId();
      if (!guestId) {
        throw new ApiError(401, 'Oturum bulunamadı. Lütfen tekrar giriş yapın.');
      }
      requestHeaders['X-User-Id'] = guestId;
    }
  }

  const url = `${getApiBaseUrl()}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers: requestHeaders,
    });
  } catch {
    throw new ApiError(
      0,
      'API sunucusuna bağlanılamadı. server klasöründe "npm start" çalıştığından emin olun.',
    );
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) {
        message = payload.error;
      }
    } catch {
      // ignore parse errors
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
