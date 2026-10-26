import { Router } from 'express';
import { handleGetAdminOrders } from '../controllers/orderController.js';
import { extractUserFromHeaders, requireRole } from '@marketplace/shared';

export const adminOrderRouter = Router();

adminOrderRouter.use(extractUserFromHeaders);
adminOrderRouter.use(requireRole('admin'));

adminOrderRouter.get('/', handleGetAdminOrders);
