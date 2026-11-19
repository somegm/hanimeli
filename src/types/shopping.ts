export interface SharedMember {
  id: string;
  name: string;
  role: 'owner' | 'member';
  avatarColor: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  isChecked: boolean;
  addedBy: string;
}

export interface ShoppingList {
  id: string;
  title: string;
  shareCode: string;
  members: SharedMember[];
  items: ShoppingListItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethodPlaceholder {
  id: string;
  label: string;
  provider: 'masterpass' | 'other';
  isEnabled: boolean;
}
