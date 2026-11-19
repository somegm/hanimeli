import { Router } from 'express';

import { resolveUserId } from '../middleware/userId';
import { WeeklyMenuModel } from '../models/WeeklyMenu';
import { UserModel } from '../models/User';
import {
  estimateIngredientCosts,
  generatePersonalizedWeeklyMenu,
} from '../services/menuPlanner/generate';
import { getUserId } from '../utils/auth';
import { mapExternalId } from '../utils/mappers';
import { sendError } from '../utils/response';

export const menusRouter = Router();

menusRouter.get('/current', async (req, res) => {
  const guestId = req.header('X-User-Id')?.trim();
  let menu = null;

  if (guestId) {
    menu = await WeeklyMenuModel.findOne({ isCurrent: true, userId: guestId }).lean();
  }

  if (!menu) {
    menu = await WeeklyMenuModel.findOne({ isCurrent: true }).lean();
  }

  if (!menu) {
    sendError(res, 404, 'Weekly menu not found');
    return;
  }

  const { shoppingIngredients, ...menuData } = menu;
  res.json({
    menu: mapExternalId(menuData),
    shoppingIngredients,
  });
});

menusRouter.post('/generate', resolveUserId, async (req, res) => {
  const userId = getUserId(req);
  const user = await UserModel.findOne({ externalId: userId }).lean();

  if (!user) {
    sendError(res, 404, 'Kullanıcı bulunamadı');
    return;
  }

  const menu = await generatePersonalizedWeeklyMenu(user as import('../services/menuPlanner/types').UserDocument);
  const ingredientNames = menu.shoppingIngredients.map((item) => item.name);
  const costEstimate = await estimateIngredientCosts(ingredientNames);

  const { shoppingIngredients, ...menuData } = menu.toObject();
  res.json({
    menu: mapExternalId(menuData),
    shoppingIngredients,
    costEstimate,
  });
});

menusRouter.post('/estimate-costs', async (req, res) => {
  const ingredients = req.body?.ingredients;
  if (!Array.isArray(ingredients)) {
    sendError(res, 400, 'ingredients dizisi gerekli');
    return;
  }

  const costEstimate = await estimateIngredientCosts(ingredients.map(String));
  res.json(costEstimate);
});
