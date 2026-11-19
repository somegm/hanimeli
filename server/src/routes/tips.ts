import { Router } from 'express';

import { CookingTipModel } from '../models/CookingTip';
import { mapExternalId } from '../utils/mappers';

export const tipsRouter = Router();

tipsRouter.get('/', async (req, res) => {
  const category = req.query.category as string | undefined;
  const filter = category && category !== 'all' ? { category } : {};
  const tips = await CookingTipModel.find(filter).lean();
  res.json(tips.map((tip) => mapExternalId(tip)));
});
