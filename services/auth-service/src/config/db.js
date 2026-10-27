import mongoose from 'mongoose';
import { logger, getMongoUri, sanitizeMongoUri, getMongoOptions } from '@marketplace/shared';

export async function connectDB(uri) {
  const mongoUri = uri || getMongoUri('MONGO_URI_AUTH', 'marketplace_auth');
  try {
    await mongoose.connect(mongoUri, getMongoOptions());
    logger.info(`[Auth-Service] Connected to MongoDB at ${sanitizeMongoUri(mongoUri)}`);
  } catch (err) {
    logger.error({ err }, `[Auth-Service] MongoDB connection failed: ${err.message}`);
    throw err;
  }
}
