import cors from 'cors';
import express from 'express';

import { connectDatabase } from './config/database';
import { env } from './config/env';
import { resolveUserId } from './middleware/userId';
import { authRouter } from './routes/auth';
import { discountsRouter } from './routes/discounts';
import { menusRouter } from './routes/menus';
import { pantryRouter } from './routes/pantry';
import { productsRouter } from './routes/products';
import { recipesRouter } from './routes/recipes';
import { routeRouter } from './routes/route';
import { shoppingRouter } from './routes/shopping';
import { syncRouter } from './routes/sync';
import { tipsRouter } from './routes/tips';
import { trackingRouter } from './routes/tracking';
import { usersRouter } from './routes/users';
import {
  checkPantryExpiryAlerts,
  checkPriceAlerts,
  recordPriceSnapshots,
} from './services/alerts/priceAlerts';
import { recordSyncError, syncMarketData } from './services/marketFiyati/sync';
import { migrateRecipeDetails } from './seed/migrate';
import { seedCatalog } from './seed/seed';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/sync', syncRouter);

app.use('/api/recipes', recipesRouter);
app.use('/api/discounts', discountsRouter);
app.use('/api/products', productsRouter);
app.use('/api/tips', tipsRouter);
app.use('/api/pantry', pantryRouter);
app.use('/api/menus', menusRouter);

app.use('/api/users', resolveUserId, usersRouter);
app.use('/api/route', resolveUserId, routeRouter);
app.use('/api/tracking', resolveUserId, trackingRouter);
app.use('/api/shopping', resolveUserId, shoppingRouter);

const ALERT_CHECK_INTERVAL_MS = 30 * 60 * 1000;

async function runMarketSync(): Promise<void> {
  try {
    const result = await syncMarketData();
    await recordPriceSnapshots();
    const alertCount = await checkPriceAlerts();
    const expiryCount = await checkPantryExpiryAlerts();
    console.log(
      `Market verisi güncellendi: ${result.productCount} ürün, ${result.discountCount} fırsat | ${alertCount} fiyat, ${expiryCount} dolap bildirimi`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Bilinmeyen senkron hatası';
    await recordSyncError(message);
    console.error('Market verisi senkronu başarısız:', message);
  }
}

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const recipeCount = await import('./models/Recipe').then((m) => m.RecipeModel.countDocuments());
  if (recipeCount === 0) {
    await seedCatalog();
    console.log('Statik katalog (tarif, ipucu, menü) yüklendi.');
  } else {
    await migrateRecipeDetails();
  }

  await runMarketSync();

  if (env.marketSyncIntervalMs > 0) {
    setInterval(() => {
      void runMarketSync();
    }, env.marketSyncIntervalMs);
  }

  setInterval(() => {
    void checkPriceAlerts();
    void checkPantryExpiryAlerts();
  }, ALERT_CHECK_INTERVAL_MS);

  app.listen(env.port, () => {
    console.log(`Hanımeli API running on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error: unknown) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});
