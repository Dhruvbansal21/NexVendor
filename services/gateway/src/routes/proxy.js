import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authenticateGateway, authorizeRole } from '../middleware/auth.js';
import { logger, forbidden, badRequest } from '@marketplace/shared';

export function createGatewayRouter() {
  const router = Router();

  const AUTH_URL = process.env.AUTH_URL || 'http://127.0.0.1:4001';
  const VENDOR_URL = process.env.VENDOR_URL || 'http://127.0.0.1:4002';
  const CATALOGUE_URL = process.env.CATALOGUE_URL || 'http://127.0.0.1:4003';
  const ORDERS_URL = process.env.ORDERS_URL || 'http://127.0.0.1:4004';

  function makeProxy(target) {
    return createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: (path, req) => req.originalUrl,
      on: {
        proxyReq: (proxyReq, req) => {
          if (req.correlationId) {
            proxyReq.setHeader('x-correlation-id', req.correlationId);
          }
          if (req.user) {
            if (req.user.id) proxyReq.setHeader('x-user-id', String(req.user.id));
            if (req.user.role) proxyReq.setHeader('x-user-role', String(req.user.role));
            if (req.user.email) proxyReq.setHeader('x-user-email', String(req.user.email));
          }
        },
        error: (err, req, res) => {
          logger.error({ err: err.message, target, correlationId: req.correlationId }, 'Gateway proxy target connection error');
          if (!res.headersSent) {
            res.status(503).json({
              error: {
                code: 'SERVICE_UNAVAILABLE',
                message: `Downstream service (${target}) is currently unreachable`,
                details: [err.message],
                correlationId: req.correlationId || 'unknown'
              }
            });
          }
        }
      }
    });
  }

  const authProxy = makeProxy(AUTH_URL);
  const vendorProxy = makeProxy(VENDOR_URL);
  const catalogueProxy = makeProxy(CATALOGUE_URL);
  const ordersProxy = makeProxy(ORDERS_URL);

  // Block any internal endpoints
  router.all('/internal*', (req, res, next) => {
    return next(forbidden('Internal endpoints cannot be accessed through the gateway', 'FORBIDDEN'));
  });

  // 1. Auth routes
  // /api/auth/register, /api/auth/login are public
  // /api/auth/me requires JWT
  router.use('/api/auth/me', authenticateGateway({ required: true }), authProxy);
  router.use('/api/auth', authProxy);

  // 2. CRITICAL SPEC RULE: /api/vendors/me/orders must be declared BEFORE /api/vendors/*
  router.use(
    ['/api/vendors/me/orders', '/api/vendors/orders'],
    authenticateGateway({ required: true }),
    authorizeRole('vendor'),
    ordersProxy
  );

  // 3. Admin vendor management
  router.use(
    '/api/admin/vendors',
    authenticateGateway({ required: true }),
    authorizeRole('admin'),
    vendorProxy
  );

  // 4. Vendor service routes
  // /api/vendors/onboard -> role: vendor
  router.use(
    '/api/vendors/onboard',
    authenticateGateway({ required: true }),
    authorizeRole('vendor'),
    vendorProxy
  );

  // /api/vendors/me -> role: vendor
  router.use(
    '/api/vendors/me',
    authenticateGateway({ required: true }),
    authorizeRole('vendor'),
    vendorProxy
  );

  // /api/vendors/:id/kyc -> admin or vendor
  router.use(
    '/api/vendors/:id/kyc',
    authenticateGateway({ required: true }),
    authorizeRole('admin', 'vendor'),
    vendorProxy
  );

  // /api/vendors list: if query 'status' is present, only admin can query; otherwise public
  router.get('/api/vendors', (req, res, next) => {
    if (req.query.status) {
      return authenticateGateway({ required: true })(req, res, () => {
        authorizeRole('admin')(req, res, next);
      });
    }
    // Public safe listing
    next();
  }, vendorProxy);

  // Generic /api/vendors (e.g. GET /api/vendors/:id)
  router.use('/api/vendors', vendorProxy);

  // 5. Catalogue routes
  // /api/catalogue/my-products -> role: vendor
  router.use(
    '/api/catalogue/my-products',
    authenticateGateway({ required: true }),
    authorizeRole('vendor'),
    catalogueProxy
  );

  // /api/catalogue/products & /api/products POST/PATCH/DELETE -> role: vendor
  const handleProductRole = (req, res, next) => {
    if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'DELETE') {
      return authenticateGateway({ required: true })(req, res, () => {
        authorizeRole('vendor')(req, res, next);
      });
    }
    next();
  };

  router.use('/api/catalogue/products', handleProductRole, catalogueProxy);
  router.use('/api/products', handleProductRole, catalogueProxy);

  // Remaining catalogue routes (GET /api/catalogue/categories, etc.)
  router.use('/api/catalogue', catalogueProxy);

  // 6. Order routes
  // /api/admin/orders -> role: admin
  router.use(
    '/api/admin/orders',
    authenticateGateway({ required: true }),
    authorizeRole('admin'),
    ordersProxy
  );

  // /api/orders/my-orders -> role: customer
  router.use(
    '/api/orders/my-orders',
    authenticateGateway({ required: true }),
    authorizeRole('customer'),
    ordersProxy
  );

  // POST /api/orders -> role: customer
  // PATCH /api/orders/:id/status -> role: vendor
  // GET /api/orders/:id -> customer, vendor, or admin
  router.use('/api/orders', (req, res, next) => {
    if (req.method === 'POST') {
      return authenticateGateway({ required: true })(req, res, () => {
        authorizeRole('customer')(req, res, next);
      });
    }
    if (req.method === 'PATCH') {
      return authenticateGateway({ required: true })(req, res, () => {
        authorizeRole('vendor')(req, res, next);
      });
    }
    // GET /api/orders/:id
    return authenticateGateway({ required: true })(req, res, next);
  }, ordersProxy);

  return router;
}
