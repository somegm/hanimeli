import 'dotenv/config';

export const env = {
  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/hanimeli',
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: process.env.JWT_SECRET ?? 'hanimeli-dev-secret-change-in-production',
  marketLatitude: Number(process.env.MARKET_LATITUDE ?? 39.97041),
  marketLongitude: Number(process.env.MARKET_LONGITUDE ?? 32.85647),
  marketDistance: Number(process.env.MARKET_DISTANCE ?? 50000),
  marketSyncIntervalMs: Number(process.env.MARKET_SYNC_INTERVAL_MS ?? 6 * 60 * 60 * 1000),
  marketMaxDiscounts: Number(process.env.MARKET_MAX_DISCOUNTS ?? 500),
  marketDiscountSearchPages: Number(process.env.MARKET_DISCOUNT_SEARCH_PAGES ?? 2),
  marketDiscountSearchSize: Number(process.env.MARKET_DISCOUNT_SEARCH_SIZE ?? 30),
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
};
