import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { loginWithEmail, registerWithEmail } from '@/services/api/authApi';
import { ApiError } from '@/services/api/client';
import {
  clearAuthSession,
  getOrCreateGuestUserId,
  loadStoredAuthUser,
  saveAuthSession,
} from '@/services/userSession';
import type { AuthUser } from '@/types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isGuest: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (email: string, password: string, displayName: string) => Promise<string | null>;
  continueAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const storedUser = await loadStoredAuthUser();
        if (storedUser) {
          setUser(storedUser);
          setIsGuest(false);
        }
      } finally {
        setIsLoading(false);
      }
    }

    void restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await loginWithEmail(email.trim().toLowerCase(), password);
      await saveAuthSession(response.token, response.user);
      setUser(response.user);
      setIsGuest(false);
      return null;
    } catch (error) {
      if (error instanceof ApiError) {
        return error.message;
      }
      return 'Giriş yapılamadı. Lütfen tekrar deneyin.';
    }
  }, []);

  const signup = useCallback(
    async (email: string, password: string, displayName: string) => {
      try {
        const response = await registerWithEmail(
          email.trim().toLowerCase(),
          password,
          displayName.trim(),
        );
        await saveAuthSession(response.token, response.user);
        setUser(response.user);
        setIsGuest(false);
        return null;
      } catch (error) {
        if (error instanceof ApiError) {
          return error.message;
        }
        return 'Kayıt oluşturulamadı. Lütfen tekrar deneyin.';
      }
    },
    [],
  );

  const continueAsGuest = useCallback(async () => {
    const guestId = await getOrCreateGuestUserId();
    setUser({
      id: guestId,
      displayName: 'Misafir',
      email: null,
    });
    setIsGuest(true);
  }, []);

  const logout = useCallback(async () => {
    await clearAuthSession();
    setUser(null);
    setIsGuest(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isGuest,
      isAuthenticated: user !== null,
      isLoading,
      login,
      signup,
      continueAsGuest,
      logout,
    }),
    [user, isGuest, isLoading, login, signup, continueAsGuest, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
