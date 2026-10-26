import express from 'express';
import mongoose from 'mongoose';
import { correlationIdMiddleware, errorHandler, notFound } from '@marketplace/shared';
import { orderRouter } from './routes/orderRoutes.js';
import { vendorOrderRouter } from './routes/vendorOrderRoutes.js';
import { adminOrderRouter } from './routes/adminOrderRoutes.js';
import { internalRouter } from './routes/internalRoutes.js';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(correlationIdMiddleware);

  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      service: 'order-service',
      uptime: process.uptime(),
      db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  });

  app.use('/api/orders', orderRouter);
  app.use('/api/vendors/me', vendorOrderRouter);
  app.use('/api/admin/orders', adminOrderRouter);
  app.use('/internal', internalRouter);

  app.use((req, res, next) => {
    next(notFound(`Route not found on Order Service: ${req.method} ${req.originalUrl}`));
  });

  app.use(errorHandler);

  return app;
}
