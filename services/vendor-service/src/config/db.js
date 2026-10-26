import mongoose from 'mongoose';
import { logger, getMongoUri, sanitizeMongoUri, getMongoOptions } from '@marketplace/shared';

export async function connectDB(uri) {
  const mongoUri = uri || getMongoUri('MONGO_URI_VENDOR', 'marketplace_vendor');
  try {
    await mongoose.connect(mongoUri, getMongoOptions());
    logger.info(`[Vendor-Service] Connected to MongoDB at ${sanitizeMongoUri(mongoUri)}`);
  } catch (err) {
    logger.error({ err }, `[Vendor-Service] MongoDB connection failed: ${err.message}`);
    throw err;
  }
}
