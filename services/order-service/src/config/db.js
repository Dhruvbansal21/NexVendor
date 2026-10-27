import mongoose from 'mongoose';
import { logger, getMongoUri, sanitizeMongoUri, getMongoOptions } from '@marketplace/shared';

export async function connectDB(uri) {
  const mongoUri = uri || getMongoUri('MONGO_URI_ORDERS', 'marketplace_orders');
  try {
    await mongoose.connect(mongoUri, getMongoOptions());
    logger.info(`[Order-Service] Connected to MongoDB at ${sanitizeMongoUri(mongoUri)}`);
  } catch (err) {
    logger.error({ err }, `[Order-Service] MongoDB connection failed: ${err.message}`);
    throw err;
  }
}
