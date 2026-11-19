import { Router } from 'express';

import { UserModel } from '../models/User';
import { suggestMarketRoute } from '../services/route/marketRoute';
import { getUserId } from '../utils/auth';
import { sendError } from '../utils/response';

export const routeRouter = Router();

routeRouter.post('/suggest', async (req, res) => {
  const userId = getUserId(req);
  const listItems = req.body?.items;

  if (!Array.isArray(listItems) || listItems.length === 0) {
    sendError(res, 400, 'items dizisi gerekli');
    return;
  }

  const user = await UserModel.findOne({ externalId: userId }).lean();
  const lat = user?.location?.latitude ?? 39.97041;
  const lng = user?.location?.longitude ?? 32.85647;

  const stops = await suggestMarketRoute(listItems.map(String), lat, lng);
  res.json({ stops });
});
