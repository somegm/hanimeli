import { Router } from 'express';

import { PantryIngredientModel } from '../models/PantryIngredient';
import { matchPantryRecipes } from '../services/recipeMatch/match';
import { generateRecipesWithAi } from '../services/recipeAi/generate';
import { env } from '../config/env';
import { mapExternalId } from '../utils/mappers';
import { sendError } from '../utils/response';

export const pantryRouter = Router();

pantryRouter.get('/ingredients', async (_req, res) => {
  const ingredients = await PantryIngredientModel.find().lean();
  res.json(ingredients.map((ingredient) => mapExternalId(ingredient)));
});

pantryRouter.post('/recipes', async (req, res) => {
  const ingredientIds = req.body?.ingredientIds;

  if (!Array.isArray(ingredientIds) || ingredientIds.length < 2) {
    sendError(res, 400, 'En az 2 malzeme seçilmelidir');
    return;
  }

  const pantryDocs = await PantryIngredientModel.find({
    externalId: { $in: ingredientIds.map(String) },
  }).lean();

  if (pantryDocs.length < 2) {
    sendError(res, 400, 'En az 2 geçerli malzeme seçilmelidir');
    return;
  }

  const ingredients = pantryDocs.map((doc) => ({
    id: doc.externalId,
    name: doc.name,
  }));

  try {
    if (env.geminiApiKey || env.openaiApiKey) {
      const recipes = await generateRecipesWithAi(ingredients);
      res.json({ recipes, source: 'ai' });
      return;
    }

    const recipes = await matchPantryRecipes(ingredients);
    res.json({ recipes, source: 'match' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';

    if (message === 'NO_MATCHING_RECIPES') {
      sendError(res, 404, 'Seçilen malzemelerle eşleşen tarif bulunamadı. Farklı malzemeler deneyin.');
      return;
    }

    if (message === 'INSUFFICIENT_INGREDIENTS') {
      sendError(res, 400, 'En az 2 malzeme seçilmelidir');
      return;
    }

    if (message.startsWith('GEMINI_API_ERROR') || message.startsWith('OPENAI_API_ERROR')) {
      try {
        const recipes = await matchPantryRecipes(ingredients);
        res.json({ recipes, source: 'match' });
        return;
      } catch {
        sendError(res, 502, 'Tarif önerileri oluşturulamadı.');
        return;
      }
    }

    sendError(res, 500, 'Tarif önerileri oluşturulamadı. Lütfen tekrar deneyin.');
  }
});
