import { apiFetch } from '@/services/api/client';
import type { ShoppingList } from '@/types/shopping';

export function fetchShoppingLists(): Promise<ShoppingList[]> {
  return apiFetch<ShoppingList[]>('/api/shopping/lists', { auth: true });
}

export function createShoppingList(title: string): Promise<ShoppingList> {
  return apiFetch<ShoppingList>('/api/shopping/lists', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ title }),
  });
}

export function toggleListItem(listId: string, itemId: string): Promise<ShoppingList> {
  return apiFetch<ShoppingList>(`/api/shopping/lists/${listId}/items/${itemId}`, {
    method: 'PATCH',
    auth: true,
  });
}

export function addListItem(
  listId: string,
  name: string,
  quantity: string,
): Promise<ShoppingList> {
  return apiFetch<ShoppingList>(`/api/shopping/lists/${listId}/items`, {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ name, quantity }),
  });
}

export function importMenuToList(
  listId: string,
  items: { name: string; quantity: string; category: string }[],
): Promise<ShoppingList> {
  return apiFetch<ShoppingList>(`/api/shopping/lists/${listId}/import`, {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ items }),
  });
}

export function joinShoppingListByCode(shareCode: string): Promise<ShoppingList> {
  return apiFetch<ShoppingList>('/api/shopping/lists/join', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ shareCode }),
  });
}
