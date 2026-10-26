import mongoose from 'mongoose';
import { logger } from '@marketplace/shared';

export async function connectDB(uri) {
  const mongoUri = uri || process.env.MONGO_URI_AUTH || 'mongodb://127.0.0.1:27017/marketplace_auth';
  try {
    await mongoose.connect(mongoUri);
    logger.info(`[Auth-Service] Connected to MongoDB at ${mongoUri}`);
  } catch (err) {
    logger.error({ err }, `[Auth-Service] MongoDB connection failed: ${err.message}`);
    throw err;
  }
}
