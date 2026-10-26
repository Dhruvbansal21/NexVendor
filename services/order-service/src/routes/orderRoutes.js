import { Router } from 'express';
import {
  handleCreateOrder,
  handleGetMyOrders,
  handleGetOrderById,
  handleUpdateStatus
} from '../controllers/orderController.js';
import { createOrderSchema, updateStatusSchema, validateBody } from '../validators/orderValidator.js';
import { extractUserFromHeaders, requireRole } from '@marketplace/shared';

export const orderRouter = Router();

orderRouter.use(extractUserFromHeaders);

orderRouter.post('/', requireRole('customer'), validateBody(createOrderSchema), handleCreateOrder);
orderRouter.get('/my-orders', requireRole('customer'), handleGetMyOrders);
orderRouter.patch('/:id/status', requireRole('vendor'), validateBody(updateStatusSchema), handleUpdateStatus);
orderRouter.get('/:id', handleGetOrderById);
