import express from 'express';
import mongoose from 'mongoose';
import { correlationIdMiddleware, errorHandler, notFound } from '@marketplace/shared';
import { vendorRouter } from './routes/vendorRoutes.js';
import { adminVendorRouter } from './routes/adminRoutes.js';
import { internalRouter } from './routes/internalRoutes.js';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(correlationIdMiddleware);

  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      service: 'vendor-service',
      uptime: process.uptime(),
      db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  });

  app.use('/api/vendors', vendorRouter);
  app.use('/api/admin/vendors', adminVendorRouter);
  app.use('/internal/vendors', internalRouter);
  app.use('/internal', internalRouter);

  app.use((req, res, next) => {
    next(notFound(`Route not found on Vendor Service: ${req.method} ${req.originalUrl}`));
  });

  app.use(errorHandler);

  return app;
}
