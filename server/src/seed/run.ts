import mongoose from 'mongoose';

import { connectDatabase } from '../config/database';
import { seedCatalog } from './seed';

async function main(): Promise<void> {
  await connectDatabase();
  await seedCatalog();
  console.log('MongoDB seed completed.');
  await mongoose.disconnect();
}

main().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
