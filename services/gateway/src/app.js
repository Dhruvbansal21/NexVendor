import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { correlationIdMiddleware, errorHandler, notFound } from '@marketplace/shared';
import { apiLimiter } from './middleware/rateLimit.js';
import { createGatewayRouter } from './routes/proxy.js';
import { dashboardRouter } from './dashboards/index.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    exposedHeaders: ['x-correlation-id', 'Idempotent-Replay']
  }));

  app.use(correlationIdMiddleware);
  app.use(apiLimiter);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      service: 'gateway',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // Mount dashboard composition routes (P6)
  app.use('/api/dashboard', dashboardRouter);

  // Mount proxy routes to downstream services
  app.use(createGatewayRouter());

  // 404 handler
  app.use((req, res, next) => {
    next(notFound(`Route not found on Gateway: ${req.method} ${req.originalUrl}`));
  });

  // Global error handler
  app.use(errorHandler);

  return app;
}
