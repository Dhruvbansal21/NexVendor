import express from 'express';
import mongoose from 'mongoose';
import { correlationIdMiddleware, errorHandler, notFound } from '@marketplace/shared';
import { catalogueRouter } from './routes/catalogueRoutes.js';
import { internalRouter } from './routes/internalRoutes.js';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(correlationIdMiddleware);

  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      service: 'catalogue-service',
      uptime: process.uptime(),
      db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  });

  app.use('/api/catalogue', catalogueRouter);
  app.use('/api/products', catalogueRouter);
  app.use('/internal', internalRouter);

  app.use((req, res, next) => {
    next(notFound(`Route not found on Catalogue Service: ${req.method} ${req.originalUrl}`));
  });

  app.use(errorHandler);

  return app;
}
