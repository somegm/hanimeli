import { Router } from 'express';

import { RecipeEngagementModel } from '../models/RecipeEngagement';
import { RecipeModel } from '../models/Recipe';
import { UserModel } from '../models/User';
import { resolveUserId } from '../middleware/userId';
import { getUserId } from '../utils/auth';
import { mapExternalId } from '../utils/mappers';
import { sendError } from '../utils/response';

export const recipesRouter = Router();

recipesRouter.get('/', async (_req, res) => {
  const recipes = await RecipeModel.find().sort({ title: 1 }).lean();
  res.json(recipes.map((recipe) => mapExternalId(recipe)));
});

recipesRouter.get('/popular', async (_req, res) => {
  const recipes = await RecipeModel.find()
    .sort({ cookCount: -1, averageRating: -1 })
    .limit(10)
    .lean();
  res.json(recipes.map((recipe) => mapExternalId(recipe)));
});

recipesRouter.get('/daily', async (_req, res) => {
  const recipes = await RecipeModel.find({ isDailyPick: true }).lean();
  res.json(recipes.map((recipe) => mapExternalId(recipe)));
});

recipesRouter.get('/:recipeId', async (req, res) => {
  const recipeId = String(req.params.recipeId);
  const recipe = await RecipeModel.findOne({ externalId: recipeId }).lean();

  if (!recipe) {
    sendError(res, 404, 'Tarif bulunamadı');
    return;
  }

  res.json(mapExternalId(recipe));
});

recipesRouter.patch('/:recipeId/favorite', resolveUserId, async (req, res) => {
  const userId = getUserId(req);
  const recipeId = String(req.params.recipeId);

  const recipe = await RecipeModel.findOne({ externalId: recipeId }).lean();
  if (!recipe) {
    sendError(res, 404, 'Tarif bulunamadı');
    return;
  }

  const user = await UserModel.findOne({ externalId: userId });
  if (!user) {
    sendError(res, 404, 'Kullanıcı bulunamadı');
    return;
  }

  const favorites = new Set(user.favoriteRecipeIds);
  if (favorites.has(recipeId)) {
    favorites.delete(recipeId);
  } else {
    favorites.add(recipeId);
  }

  user.favoriteRecipeIds = [...favorites];
  await user.save();

  res.json({ isFavorite: favorites.has(recipeId) });
});

recipesRouter.post('/:recipeId/cooked', resolveUserId, async (req, res) => {
  const userId = getUserId(req);
  const recipeId = String(req.params.recipeId);

  const recipe = await RecipeModel.findOne({ externalId: recipeId });
  if (!recipe) {
    sendError(res, 404, 'Tarif bulunamadı');
    return;
  }

  const user = await UserModel.findOne({ externalId: userId });
  if (!user) {
    sendError(res, 404, 'Kullanıcı bulunamadı');
    return;
  }

  if (!user.cookedRecipeIds.includes(recipeId)) {
    user.cookedRecipeIds.push(recipeId);
    await user.save();
  }

  recipe.cookCount += 1;
  await recipe.save();

  await RecipeEngagementModel.findOneAndUpdate(
    { userId, recipeId },
    { userId, recipeId, cookedAt: new Date().toISOString() },
    { upsert: true },
  );

  res.json({ cookCount: recipe.cookCount });
});

recipesRouter.post('/:recipeId/rate', resolveUserId, async (req, res) => {
  const userId = getUserId(req);
  const recipeId = String(req.params.recipeId);
  const rating = Number(req.body?.rating);

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    sendError(res, 400, '1-5 arası rating gerekli');
    return;
  }

  const recipe = await RecipeModel.findOne({ externalId: recipeId });
  if (!recipe) {
    sendError(res, 404, 'Tarif bulunamadı');
    return;
  }

  const existing = await RecipeEngagementModel.findOne({ userId, recipeId });
  const oldRating = existing?.rating;

  await RecipeEngagementModel.findOneAndUpdate(
    { userId, recipeId },
    { userId, recipeId, rating },
    { upsert: true },
  );

  if (oldRating) {
    const total = recipe.averageRating * recipe.ratingCount - oldRating + rating;
    recipe.averageRating = Math.round((total / recipe.ratingCount) * 10) / 10;
  } else {
    const total = recipe.averageRating * recipe.ratingCount + rating;
    recipe.ratingCount += 1;
    recipe.averageRating = Math.round((total / recipe.ratingCount) * 10) / 10;
  }

  await recipe.save();

  res.json({ averageRating: recipe.averageRating, ratingCount: recipe.ratingCount });
});
