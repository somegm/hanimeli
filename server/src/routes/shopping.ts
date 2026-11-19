import { randomUUID } from 'crypto';
import { Router } from 'express';

import { ShoppingListModel } from '../models/ShoppingList';
import { SEED_DEFAULT_SHOPPING_LIST } from '../seed/data';
import { getUserId } from '../utils/auth';
import { mapShoppingList } from '../utils/mappers';
import { sendError } from '../utils/response';

export const shoppingRouter = Router();

function generateShareCode(): string {
  return `HAN-${Math.floor(1000 + Math.random() * 9000)}`;
}

async function ensureDefaultList(userId: string) {
  const existing = await ShoppingListModel.findOne({ ownerId: userId }).lean();
  if (existing) {
    return existing;
  }

  const created = await ShoppingListModel.create({
    externalId: randomUUID(),
    ownerId: userId,
    title: SEED_DEFAULT_SHOPPING_LIST.title,
    shareCode: generateShareCode(),
    members: SEED_DEFAULT_SHOPPING_LIST.members,
    items: SEED_DEFAULT_SHOPPING_LIST.items,
    createdAt: SEED_DEFAULT_SHOPPING_LIST.createdAt,
    updatedAt: SEED_DEFAULT_SHOPPING_LIST.updatedAt,
  });

  return created.toObject();
}

function listAccessFilter(userId: string) {
  return {
    $or: [{ ownerId: userId }, { 'members.externalId': userId }],
  };
}

async function findAccessibleList(listId: string, userId: string) {
  return ShoppingListModel.findOne({
    externalId: listId,
    ...listAccessFilter(userId),
  });
}

shoppingRouter.get('/lists', async (req, res) => {
  const userId = getUserId(req);
  await ensureDefaultList(userId);

  const lists = await ShoppingListModel.find(listAccessFilter(userId))
    .sort({ updatedAt: -1 })
    .lean();

  res.json(lists.map(mapShoppingList));
});

shoppingRouter.post('/lists', async (req, res) => {
  const userId = getUserId(req);
  const title = String(req.body?.title ?? 'Yeni Liste').trim() || 'Yeni Liste';
  const now = new Date().toISOString();

  const list = await ShoppingListModel.create({
    externalId: randomUUID(),
    ownerId: userId,
    title,
    shareCode: generateShareCode(),
    members: [{ externalId: 'm-owner', name: 'Sen', role: 'owner', avatarColor: '#D4A017' }],
    items: [],
    createdAt: now,
    updatedAt: now,
  });

  res.status(201).json(mapShoppingList(list.toObject()));
});

shoppingRouter.post('/lists/join', async (req, res) => {
  const userId = getUserId(req);
  const shareCode = String(req.body?.shareCode ?? '').trim().toUpperCase();

  if (!shareCode) {
    sendError(res, 400, 'shareCode is required');
    return;
  }

  const list = await ShoppingListModel.findOne({ shareCode });
  if (!list) {
    sendError(res, 404, 'Paylaşım kodu ile liste bulunamadı');
    return;
  }

  const alreadyMember = list.members.some((member) => member.externalId === userId);
  if (!alreadyMember) {
    const memberColors = ['#E85D4C', '#4CAF50', '#5D4037', '#2196F3'];
    list.members.push({
      externalId: userId,
      name: 'Sen',
      role: 'member',
      avatarColor: memberColors[list.members.length % memberColors.length],
    });
    list.updatedAt = new Date().toISOString();
    await list.save();
  }

  res.json(mapShoppingList(list.toObject()));
});

shoppingRouter.patch('/lists/:listId/items/:itemId', async (req, res) => {
  const userId = getUserId(req);
  const { listId, itemId } = req.params;

  const list = await findAccessibleList(listId, userId);
  if (!list) {
    sendError(res, 404, 'Shopping list not found');
    return;
  }

  const item = list.items.find((entry) => entry.externalId === itemId);
  if (!item) {
    sendError(res, 404, 'List item not found');
    return;
  }

  item.isChecked = !item.isChecked;
  list.updatedAt = new Date().toISOString();
  await list.save();

  res.json(mapShoppingList(list.toObject()));
});

shoppingRouter.post('/lists/:listId/items', async (req, res) => {
  const userId = getUserId(req);
  const { listId } = req.params;
  const name = String(req.body?.name ?? '').trim();
  const quantity = String(req.body?.quantity ?? '1 adet').trim() || '1 adet';

  if (!name) {
    sendError(res, 400, 'Item name is required');
    return;
  }

  const list = await findAccessibleList(listId, userId);
  if (!list) {
    sendError(res, 404, 'Shopping list not found');
    return;
  }

  list.items.push({
    externalId: randomUUID(),
    name,
    quantity,
    category: 'Diğer',
    isChecked: false,
    addedBy: 'Sen',
  });
  list.updatedAt = new Date().toISOString();
  await list.save();

  res.status(201).json(mapShoppingList(list.toObject()));
});

shoppingRouter.post('/lists/:listId/import', async (req, res) => {
  const userId = getUserId(req);
  const { listId } = req.params;
  const items = req.body?.items;

  if (!Array.isArray(items) || items.length === 0) {
    sendError(res, 400, 'items array is required');
    return;
  }

  const list = await findAccessibleList(listId, userId);
  if (!list) {
    sendError(res, 404, 'Shopping list not found');
    return;
  }

  for (const item of items) {
    list.items.push({
      externalId: randomUUID(),
      name: String(item.name),
      quantity: String(item.quantity ?? '1 adet'),
      category: String(item.category ?? 'Diğer'),
      isChecked: false,
      addedBy: 'Menü Planlayıcı',
    });
  }

  list.updatedAt = new Date().toISOString();
  await list.save();

  res.json(mapShoppingList(list.toObject()));
});
