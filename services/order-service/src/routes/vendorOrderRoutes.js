import { Router } from 'express';
import { handleGetVendorOrders } from '../controllers/orderController.js';
import { extractUserFromHeaders, requireRole } from '@marketplace/shared';

export const vendorOrderRouter = Router();

vendorOrderRouter.use(extractUserFromHeaders);
vendorOrderRouter.use(requireRole('vendor'));

vendorOrderRouter.get('/orders', handleGetVendorOrders);
