import { useRouter, useSegments, type Href } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '@/context/AuthContext';

export function AuthRedirect() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const rootSegment = segments[0];
    const onLogin = rootSegment === 'login';
    const inApp = rootSegment === '(tabs)';

    if (!isAuthenticated && inApp) {
      router.replace('/login' as Href);
      return;
    }

    if (isAuthenticated && onLogin) {
      router.replace('/(tabs)' as Href);
    }
  }, [isAuthenticated, isLoading, segments, router]);

  return null;
}
