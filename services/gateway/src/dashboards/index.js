import { Router } from 'express';
import { authenticateGateway, authorizeRole } from '../middleware/auth.js';
import { sendSuccess } from '@marketplace/shared';

export const dashboardRouter = Router();

// Placeholder endpoints until Phase 6 full composition
dashboardRouter.get('/customer', authenticateGateway({ required: true }), authorizeRole('customer'), (req, res) => {
  return sendSuccess(res, {
    totalOrders: 0,
    activeOrders: 0,
    recentOrders: []
  });
});

dashboardRouter.get('/vendor', authenticateGateway({ required: true }), authorizeRole('vendor'), (req, res) => {
  return sendSuccess(res, {
    totalProducts: 0,
    totalSalesPaise: 0,
    pendingOrders: 0,
    recentOrders: []
  });
});

dashboardRouter.get('/admin', authenticateGateway({ required: true }), authorizeRole('admin'), (req, res) => {
  return sendSuccess(res, {
    totalUsers: 0,
    totalVendors: 0,
    pendingVendors: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenuePaise: 0
  });
});
