import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { logger } from '@marketplace/shared';

const PORT = process.env.PORT_CATALOGUE || 4003;

async function start() {
  await connectDB(process.env.MONGO_URI_CATALOGUE);
  const app = createApp();

  const server = app.listen(PORT, () => {
    logger.info(`[Catalogue-Service] running on port ${PORT}`);
  });

  process.on('SIGTERM', () => {
    logger.info('[Catalogue-Service] SIGTERM received, closing server');
    server.close(() => process.exit(0));
  });

  process.on('SIGINT', () => {
    logger.info('[Catalogue-Service] SIGINT received, closing server');
    server.close(() => process.exit(0));
  });
}

start().catch(err => {
  logger.error({ err }, '[Catalogue-Service] Startup failed');
  process.exit(1);
});
