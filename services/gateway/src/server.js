import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { createApp } from './app.js';
import { logger } from '@marketplace/shared';

const PORT = process.env.PORT_GATEWAY || 4000;
const app = createApp();

const server = app.listen(PORT, () => {
  logger.info(`[Gateway] running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  logger.info('[Gateway] SIGTERM received, closing server');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  logger.info('[Gateway] SIGINT received, closing server');
  server.close(() => process.exit(0));
});
