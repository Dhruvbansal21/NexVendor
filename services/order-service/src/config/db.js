import mongoose from 'mongoose';
import { logger } from '@marketplace/shared';

export async function connectDB(uri) {
  const mongoUri = uri || process.env.MONGO_URI_ORDERS || 'mongodb://127.0.0.1:27017/marketplace_orders';
  try {
    await mongoose.connect(mongoUri);
    logger.info(`[Order-Service] Connected to MongoDB at ${mongoUri}`);
  } catch (err) {
    logger.error({ err }, `[Order-Service] MongoDB connection failed: ${err.message}`);
    throw err;
  }
}
