import { Router } from 'express';

import { UserModel } from '../models/User';
import {
  getSyncStatus,
  recordSyncError,
  syncMarketData,
} from '../services/marketFiyati/sync';
import { resolveUserId } from '../middleware/userId';
import { getUserId } from '../utils/auth';
import { sendError } from '../utils/response';

export const syncRouter = Router();

syncRouter.get('/status', async (_req, res) => {
  const status = await getSyncStatus();
  res.json(
    status ?? {
      key: 'market_data',
      status: 'pending',
      source: 'marketfiyati.org.tr',
      message: 'Henüz senkron yapılmadı.',
    },
  );
});

syncRouter.post('/market-data', async (req, res) => {
  try {
    const { latitude, longitude, distance } = req.body ?? {};
    const location =
      Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))
        ? {
            latitude: Number(latitude),
            longitude: Number(longitude),
            distance: Number.isFinite(Number(distance)) ? Number(distance) : undefined,
          }
        : undefined;

    const result = await syncMarketData(location);
    res.json({
      message: 'Market verileri marketfiyati.org.tr üzerinden güncellendi.',
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Market verisi senkronu başarısız.';
    await recordSyncError(message);
    sendError(res, 502, message);
  }
});

syncRouter.post('/market-data/me', resolveUserId, async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = await UserModel.findOne({ externalId: userId }).lean();

    if (!user?.location) {
      sendError(res, 400, 'Önce konum ayarlayın');
      return;
    }

    const result = await syncMarketData({
      latitude: user.location.latitude,
      longitude: user.location.longitude,
    });

    res.json({
      message: 'Konumunuza göre market verileri güncellendi.',
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Market verisi senkronu başarısız.';
    await recordSyncError(message);
    sendError(res, 502, message);
  }
});
