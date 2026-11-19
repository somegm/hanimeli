import { Router } from 'express';

import { UserModel } from '../models/User';
import { getUserId } from '../utils/auth';
import { matchPantryRecipes } from '../services/recipeMatch/match';
import { sendError } from '../utils/response';

export const usersRouter = Router();

function mapUserProfile(user: {
  externalId: string;
  displayName: string;
  email?: string | null;
  location?: {
    city: string;
    district?: string;
    latitude: number;
    longitude: number;
    label: string;
  };
  dietProfile?: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    lactoseFree: boolean;
    allergies: string[];
  };
  household?: {
    adultCount: number;
    childAges: number[];
    dailyCalorieTarget: number;
  };
  pantryItems?: {
    ingredientId: string;
    name: string;
    quantity: string;
    expiresAt: string | null;
  }[];
  favoriteRecipeIds?: string[];
  cookedRecipeIds?: string[];
}) {
  return {
    id: user.externalId,
    displayName: user.displayName,
    email: user.email,
    location: user.location,
    dietProfile: user.dietProfile ?? {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      lactoseFree: false,
      allergies: [],
    },
    household: user.household ?? {
      adultCount: 2,
      childAges: [],
      dailyCalorieTarget: 2000,
    },
    pantryItems: user.pantryItems ?? [],
    favoriteRecipeIds: user.favoriteRecipeIds ?? [],
    cookedRecipeIds: user.cookedRecipeIds ?? [],
  };
}

usersRouter.get('/me', async (req, res) => {
  const userId = getUserId(req);
  const user = await UserModel.findOne({ externalId: userId }).lean();

  if (!user) {
    sendError(res, 404, 'Kullanıcı bulunamadı');
    return;
  }

  res.json(mapUserProfile(user as Parameters<typeof mapUserProfile>[0]));
});

usersRouter.patch('/me/location', async (req, res) => {
  const userId = getUserId(req);
  const { city, district, latitude, longitude, label } = req.body ?? {};

  if (!city || !Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
    sendError(res, 400, 'city, latitude ve longitude gerekli');
    return;
  }

  const location = {
    city: String(city),
    district: district ? String(district) : undefined,
    latitude: Number(latitude),
    longitude: Number(longitude),
    label: label ? String(label) : String(city),
  };

  const user = await UserModel.findOneAndUpdate(
    { externalId: userId },
    { location },
    { new: true },
  ).lean();

  if (!user) {
    sendError(res, 404, 'Kullanıcı bulunamadı');
    return;
  }

  res.json({ location: user.location });
});

usersRouter.patch('/me/push-token', async (req, res) => {
  const userId = getUserId(req);
  const token = req.body?.expoPushToken;

  if (!token || typeof token !== 'string') {
    sendError(res, 400, 'expoPushToken gerekli');
    return;
  }

  await UserModel.updateOne({ externalId: userId }, { expoPushToken: token });
  res.json({ registered: true });
});

usersRouter.patch('/me/diet', async (req, res) => {
  const userId = getUserId(req);
  const dietProfile = req.body ?? {};

  const user = await UserModel.findOneAndUpdate(
    { externalId: userId },
    {
      dietProfile: {
        vegetarian: Boolean(dietProfile.vegetarian),
        vegan: Boolean(dietProfile.vegan),
        glutenFree: Boolean(dietProfile.glutenFree),
        lactoseFree: Boolean(dietProfile.lactoseFree),
        allergies: Array.isArray(dietProfile.allergies)
          ? dietProfile.allergies.map(String)
          : [],
      },
    },
    { new: true },
  ).lean();

  if (!user) {
    sendError(res, 404, 'Kullanıcı bulunamadı');
    return;
  }

  res.json({ dietProfile: user.dietProfile });
});

usersRouter.patch('/me/household', async (req, res) => {
  const userId = getUserId(req);
  const body = req.body ?? {};

  const household = {
    adultCount: Math.max(1, Number(body.adultCount) || 2),
    childAges: Array.isArray(body.childAges)
      ? body.childAges.map((age: unknown) => Number(age)).filter(Number.isFinite)
      : [],
    dailyCalorieTarget: Math.max(1000, Number(body.dailyCalorieTarget) || 2000),
  };

  const user = await UserModel.findOneAndUpdate(
    { externalId: userId },
    { household },
    { new: true },
  ).lean();

  if (!user) {
    sendError(res, 404, 'Kullanıcı bulunamadı');
    return;
  }

  res.json({ household: user.household });
});

usersRouter.get('/me/pantry', async (req, res) => {
  const userId = getUserId(req);
  const user = await UserModel.findOne({ externalId: userId }).lean();
  res.json({ items: user?.pantryItems ?? [] });
});

usersRouter.put('/me/pantry', async (req, res) => {
  const userId = getUserId(req);
  const items = req.body?.items;

  if (!Array.isArray(items)) {
    sendError(res, 400, 'items dizisi gerekli');
    return;
  }

  const pantryItems = items.map((item: Record<string, unknown>) => ({
    ingredientId: String(item.ingredientId ?? ''),
    name: String(item.name ?? ''),
    quantity: String(item.quantity ?? '1'),
    expiresAt: item.expiresAt ? String(item.expiresAt) : null,
  }));

  const user = await UserModel.findOneAndUpdate(
    { externalId: userId },
    { pantryItems },
    { new: true },
  ).lean();

  res.json({ items: user?.pantryItems ?? [] });
});

usersRouter.get('/me/expiring-pantry', async (req, res) => {
  const userId = getUserId(req);
  const user = await UserModel.findOne({ externalId: userId }).lean();
  const now = new Date();

  const expiring = (user?.pantryItems ?? []).filter((item) => {
    if (!item.expiresAt) {
      return false;
    }
    const daysLeft = Math.ceil(
      (new Date(item.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysLeft <= 3;
  });

  res.json({ items: expiring });
});

usersRouter.get('/me/expiring-recipes', async (req, res) => {
  const userId = getUserId(req);
  const user = await UserModel.findOne({ externalId: userId }).lean();
  const now = new Date();

  const expiring = (user?.pantryItems ?? []).filter((item) => {
    if (!item.expiresAt) {
      return false;
    }
    const daysLeft = Math.ceil(
      (new Date(item.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysLeft <= 3;
  });

  if (expiring.length < 2) {
    res.json({ recipes: [], message: 'En az 2 yaklaşan SKT ürünü gerekli' });
    return;
  }

  try {
    const ingredients = expiring.map((item) => ({
      id: item.ingredientId,
      name: item.name,
    }));
    const recipes = await matchPantryRecipes(ingredients);
    res.json({ recipes });
  } catch {
    res.json({ recipes: [], message: 'Eşleşen tarif bulunamadı' });
  }
});
