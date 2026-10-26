import { Router } from 'express';
import { handleGetVendorOrders, handleUpdateStatus } from '../controllers/orderController.js';
import { extractUserFromHeaders, requireRole } from '@marketplace/shared';

export const vendorOrderRouter = Router();

vendorOrderRouter.use(extractUserFromHeaders);
vendorOrderRouter.use(requireRole('vendor'));

vendorOrderRouter.get('/orders', handleGetVendorOrders);
vendorOrderRouter.patch('/orders/:id/sub-orders/:subOrderId/status', (req, res, next) => {
  req.body.subOrderId = req.params.subOrderId;
  handleUpdateStatus(req, res, next);
});
vendorOrderRouter.patch('/orders/:id/status', handleUpdateStatus);

