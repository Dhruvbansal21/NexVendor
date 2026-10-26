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

const checkIdempotency = (req, res, next) => {
  const idempotencyKey = req.headers['idempotency-key'];
  if (!idempotencyKey || typeof idempotencyKey !== 'string' || idempotencyKey.trim() === '') {
    return res.status(400).json({
      error: {
        code: 'IDEMPOTENCY_KEY_REQUIRED',
        message: 'Header Idempotency-Key is required for order creation',
        details: [],
        correlationId: req.correlationId || ''
      }
    });
  }
  next();
};

orderRouter.post('/', requireRole('customer'), checkIdempotency, validateBody(createOrderSchema), handleCreateOrder);
orderRouter.get('/my-orders', requireRole('customer'), handleGetMyOrders);
orderRouter.patch('/:id/status', requireRole('vendor'), validateBody(updateStatusSchema), handleUpdateStatus);
orderRouter.patch('/:id/sub-orders/:subOrderId/status', requireRole('vendor'), (req, res, next) => {
  req.body.subOrderId = req.params.subOrderId;
  handleUpdateStatus(req, res, next);
});
orderRouter.get('/:id', handleGetOrderById);
