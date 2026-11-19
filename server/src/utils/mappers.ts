export function mapExternalId<T extends { externalId: string }>(
  doc: T,
): Omit<T, 'externalId'> & { id: string } {
  const { externalId, ...rest } = doc;
  return { ...rest, id: externalId };
}

export function mapListItem(item: {
  externalId: string;
  name: string;
  quantity: string;
  category: string;
  isChecked: boolean;
  addedBy: string;
}) {
  return {
    id: item.externalId,
    name: item.name,
    quantity: item.quantity,
    category: item.category,
    isChecked: item.isChecked,
    addedBy: item.addedBy,
  };
}

export function mapMember(member: {
  externalId: string;
  name: string;
  role: 'owner' | 'member';
  avatarColor: string;
}) {
  return {
    id: member.externalId,
    name: member.name,
    role: member.role,
    avatarColor: member.avatarColor,
  };
}

export function mapShoppingList(list: {
  externalId: string;
  title: string;
  shareCode: string;
  members: {
    externalId: string;
    name: string;
    role: 'owner' | 'member';
    avatarColor: string;
  }[];
  items: {
    externalId: string;
    name: string;
    quantity: string;
    category: string;
    isChecked: boolean;
    addedBy: string;
  }[];
  createdAt: string;
  updatedAt: string;
}) {
  return {
    id: list.externalId,
    title: list.title,
    shareCode: list.shareCode,
    members: list.members.map(mapMember),
    items: list.items.map(mapListItem),
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
  };
}
