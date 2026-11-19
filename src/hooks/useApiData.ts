import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/services/api/client';

interface AsyncState<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

export function useApiData<T>(initialValue: T, loader: () => Promise<T>): AsyncState<T> {
  const [data, setData] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await loader();
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof ApiError
              ? err.message
              : 'Veriler yüklenirken bir hata oluştu.';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [loader, reloadToken]);

  return { data, isLoading, error, reload };
}
