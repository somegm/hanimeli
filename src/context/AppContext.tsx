import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  addListItem as addListItemApi,
  createShoppingList as createShoppingListApi,
  fetchShoppingLists,
  importMenuToList as importMenuToListApi,
  joinShoppingListByCode,
  toggleListItem as toggleListItemApi,
} from '@/services/api/shoppingApi';
import {
  fetchTrackedProducts,
  simulatePriceDrop as simulatePriceDropApi,
  toggleFavorite as toggleFavoriteApi,
  togglePriceAlert as togglePriceAlertApi,
  updateTargetPrice as updateTargetPriceApi,
} from '@/services/api/trackingApi';
import { schedulePriceDropAlert } from '@/services/notificationService';
import type { TrackedProduct } from '@/types/tracking';
import type { ShoppingList } from '@/types/shopping';

interface AppContextValue {
  trackedProducts: TrackedProduct[];
  toggleFavorite: (productId: string) => Promise<void>;
  togglePriceAlert: (productId: string) => Promise<void>;
  updateTargetPrice: (productId: string, targetPrice: number) => Promise<void>;
  simulatePriceDrop: (productId: string) => Promise<void>;
  shoppingLists: ShoppingList[];
  createShoppingList: (title: string) => Promise<void>;
  joinShoppingList: (shareCode: string) => Promise<ShoppingList | null>;
  toggleListItem: (listId: string, itemId: string) => Promise<void>;
  addListItem: (listId: string, name: string, quantity: string) => Promise<void>;
  importMenuToList: (
    listId: string,
    items: { name: string; quantity: string; category: string }[],
  ) => Promise<void>;
  isHydrated: boolean;
  hydrateError: string | null;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [trackedProducts, setTrackedProducts] = useState<TrackedProduct[]>([]);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [hydrateError, setHydrateError] = useState<string | null>(null);

  useEffect(() => {
    async function hydrate() {
      try {
        const [tracking, lists] = await Promise.all([
          fetchTrackedProducts(),
          fetchShoppingLists(),
        ]);
        setTrackedProducts(tracking);
        setShoppingLists(lists);
        setHydrateError(null);
      } catch {
        setHydrateError('Kullanıcı verileri MongoDB API üzerinden yüklenemedi.');
      } finally {
        setIsHydrated(true);
      }
    }

    void hydrate();
  }, []);

  const toggleFavorite = useCallback(async (productId: string) => {
    const result = await toggleFavoriteApi(productId);
    setTrackedProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? { ...product, isFavorite: result.isFavorite }
          : product,
      ),
    );
  }, []);

  const togglePriceAlert = useCallback(async (productId: string) => {
    const result = await togglePriceAlertApi(productId);
    setTrackedProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? { ...product, alertEnabled: result.alertEnabled }
          : product,
      ),
    );
  }, []);

  const updateTargetPrice = useCallback(async (productId: string, targetPrice: number) => {
    const result = await updateTargetPriceApi(productId, targetPrice);
    setTrackedProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? { ...product, targetPrice: result.targetPrice, alertEnabled: true }
          : product,
      ),
    );
  }, []);

  const simulatePriceDrop = useCallback(async (productId: string) => {
    const result = await simulatePriceDropApi(productId);

    setTrackedProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? {
              ...product,
              currentPrice: result.currentPrice,
              lastChecked: new Date().toISOString(),
            }
          : product,
      ),
    );

    if (result.shouldAlert) {
      await schedulePriceDropAlert(
        result.productName,
        result.currentPrice,
        result.storeName,
      );
    }
  }, []);

  const createShoppingList = useCallback(async (title: string) => {
    const created = await createShoppingListApi(title);
    setShoppingLists((prev) => [created, ...prev]);
  }, []);

  const joinShoppingList = useCallback(async (shareCode: string) => {
    try {
      const joined = await joinShoppingListByCode(shareCode);
      setShoppingLists((prev) => {
        const exists = prev.some((list) => list.id === joined.id);
        if (exists) {
          return prev.map((list) => (list.id === joined.id ? joined : list));
        }
        return [joined, ...prev];
      });
      return joined;
    } catch {
      return null;
    }
  }, []);

  const toggleListItem = useCallback(async (listId: string, itemId: string) => {
    const updated = await toggleListItemApi(listId, itemId);
    setShoppingLists((prev) =>
      prev.map((list) => (list.id === updated.id ? updated : list)),
    );
  }, []);

  const addListItem = useCallback(async (listId: string, name: string, quantity: string) => {
    const updated = await addListItemApi(listId, name, quantity);
    setShoppingLists((prev) =>
      prev.map((list) => (list.id === updated.id ? updated : list)),
    );
  }, []);

  const importMenuToList = useCallback(
    async (
      listId: string,
      items: { name: string; quantity: string; category: string }[],
    ) => {
      const updated = await importMenuToListApi(listId, items);
      setShoppingLists((prev) =>
        prev.map((list) => (list.id === updated.id ? updated : list)),
      );
    },
    [],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      trackedProducts,
      toggleFavorite,
      togglePriceAlert,
      updateTargetPrice,
      simulatePriceDrop,
      shoppingLists,
      createShoppingList,
      joinShoppingList,
      toggleListItem,
      addListItem,
      importMenuToList,
      isHydrated,
      hydrateError,
    }),
    [
      trackedProducts,
      toggleFavorite,
      togglePriceAlert,
      updateTargetPrice,
      simulatePriceDrop,
      shoppingLists,
      createShoppingList,
      joinShoppingList,
      toggleListItem,
      addListItem,
      importMenuToList,
      isHydrated,
      hydrateError,
    ],
  );

  if (!isHydrated) {
    return null;
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
