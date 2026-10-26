import { Router } from 'express';
import { authenticateGateway, authorizeRole } from '../middleware/auth.js';
import { sendSuccess, internalRequest, logger } from '@marketplace/shared';

export const dashboardRouter = Router();

const AUTH_URL = process.env.AUTH_URL || 'http://127.0.0.1:4001';
const VENDOR_URL = process.env.VENDOR_URL || 'http://127.0.0.1:4002';
const CATALOGUE_URL = process.env.CATALOGUE_URL || 'http://127.0.0.1:4003';
const ORDERS_URL = process.env.ORDERS_URL || 'http://127.0.0.1:4004';

// 1. Customer Dashboard Composition
dashboardRouter.get(
  '/customer',
  authenticateGateway({ required: true }),
  authorizeRole('customer'),
  async (req, res, next) => {
    try {
      const customerId = req.user.id;
      const correlationId = req.correlationId;

      const orderStatsRes = await internalRequest(
        `${ORDERS_URL}/internal/orders/customer-stats/${customerId}`,
        { method: 'GET', correlationId }
      );

      return sendSuccess(res, orderStatsRes.data, 200);
    } catch (err) {
      next(err);
    }
  }
);

// 2. Vendor Dashboard Composition
dashboardRouter.get(
  '/vendor',
  authenticateGateway({ required: true }),
  authorizeRole('vendor'),
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const correlationId = req.correlationId;

      // Look up vendor record
      let vendor = null;
      try {
        const vendorRes = await internalRequest(
          `${VENDOR_URL}/internal/vendors/by-user/${userId}`,
          { method: 'GET', correlationId }
        );
        vendor = vendorRes.data;
      } catch (err) {
        if (err.statusCode !== 404) throw err;
      }

      if (!vendor) {
        return sendSuccess(res, {
          storeName: null,
          status: 'not_onboarded',
          totalProducts: 0,
          totalSalesPaise: 0,
          pendingOrders: 0,
          recentOrders: []
        }, 200);
      }

      // Query vendor orders and catalogue in parallel
      const [orderStatsRes, catStatsRes] = await Promise.all([
        internalRequest(
          `${ORDERS_URL}/internal/orders/vendor-stats/${vendor.id}`,
          { method: 'GET', correlationId }
        ).catch(() => ({ data: { totalSalesPaise: 0, totalSubOrders: 0, pendingOrders: 0, recentOrders: [] } })),
        internalRequest(
          `${CATALOGUE_URL}/internal/stats`,
          { method: 'GET', correlationId }
        ).catch(() => ({ data: { totalProducts: 0 } }))
      ]);

      return sendSuccess(res, {
        storeName: vendor.storeName,
        status: vendor.status,
        rejectionReason: vendor.rejectionReason,
        totalProducts: catStatsRes.data.totalProducts,
        totalSalesPaise: orderStatsRes.data.totalSalesPaise || 0,
        totalSubOrders: orderStatsRes.data.totalSubOrders || 0,
        pendingOrders: orderStatsRes.data.pendingOrders || 0,
        recentOrders: orderStatsRes.data.recentOrders || []
      }, 200);
    } catch (err) {
      next(err);
    }
  }
);

// 3. Admin Dashboard Composition (aggregates all 4 microservices)
dashboardRouter.get(
  '/admin',
  authenticateGateway({ required: true }),
  authorizeRole('admin'),
  async (req, res, next) => {
    try {
      const correlationId = req.correlationId;

      const [authStats, vendorStats, catalogueStats, orderStats] = await Promise.all([
        internalRequest(`${AUTH_URL}/internal/stats`, { method: 'GET', correlationId }),
        internalRequest(`${VENDOR_URL}/internal/stats`, { method: 'GET', correlationId }),
        internalRequest(`${CATALOGUE_URL}/internal/stats`, { method: 'GET', correlationId }),
        internalRequest(`${ORDERS_URL}/internal/stats`, { method: 'GET', correlationId })
      ]);

      const composed = {
        users: authStats.data,
        vendors: vendorStats.data,
        catalogue: catalogueStats.data,
        orders: orderStats.data,
        summary: {
          totalUsers: authStats.data.totalUsers,
          totalVendors: vendorStats.data.totalVendors,
          pendingVendors: vendorStats.data.pendingVendors,
          totalProducts: catalogueStats.data.totalProducts,
          totalOrders: orderStats.data.totalOrders,
          totalRevenuePaise: orderStats.data.totalRevenuePaise
        }
      };

      return sendSuccess(res, composed, 200);
    } catch (err) {
      next(err);
    }
  }
);
