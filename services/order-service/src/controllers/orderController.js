import * as orderService from '../services/orderService.js';
import { sendSuccess, sendPaginated, badRequest, unauthorized } from '@marketplace/shared';

export async function handleCreateOrder(req, res, next) {
  try {
    const idempotencyKey = req.headers['idempotency-key'];
    if (!idempotencyKey || typeof idempotencyKey !== 'string' || idempotencyKey.trim() === '') {
      return next(badRequest('Header Idempotency-Key is required for order creation', [], 'IDEMPOTENCY_KEY_REQUIRED'));
    }

    const customerId = req.headers['x-user-id'];
    if (!customerId) {
      return next(unauthorized('Customer identity missing', 'UNAUTHORIZED'));
    }

    const result = await orderService.createOrder({
      customerId,
      idempotencyKey: idempotencyKey.trim(),
      items: req.body.items,
      shippingAddress: req.body.shippingAddress,
      correlationId: req.correlationId
    });

    const headers = result.isReplay ? { 'Idempotent-Replay': 'true' } : {};
    const statusCode = result.isReplay ? 200 : 201;

    return sendSuccess(res, result.order, statusCode, headers);
  } catch (err) {
    next(err);
  }
}

export async function handleGetMyOrders(req, res, next) {
  try {
    const customerId = req.headers['x-user-id'];
    if (!customerId) {
      return next(unauthorized('Customer identity missing', 'UNAUTHORIZED'));
    }
    const result = await orderService.getCustomerOrders(customerId, req.query);
    return sendPaginated(res, result.orders, result.page, result.limit, result.total, 200);
  } catch (err) {
    next(err);
  }
}

export async function handleGetOrderById(req, res, next) {
  try {
    const requestingUser = req.headers['x-user-id'] ? {
      id: req.headers['x-user-id'],
      role: req.headers['x-user-role']
    } : null;

    const order = await orderService.getOrderById(req.params.id, requestingUser);
    return sendSuccess(res, order, 200);
  } catch (err) {
    next(err);
  }
}

export async function handleGetVendorOrders(req, res, next) {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return next(unauthorized('Vendor identity missing', 'UNAUTHORIZED'));
    }
    const result = await orderService.getVendorOrders(userId, req.query, req.correlationId);
    return sendPaginated(res, result.orders, result.page, result.limit, result.total, 200);
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateStatus(req, res, next) {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return next(unauthorized('Vendor identity missing', 'UNAUTHORIZED'));
    }
    const order = await orderService.updateSubOrderStatus(
      userId,
      req.params.id,
      req.body.subOrderId,
      req.body.status,
      req.correlationId
    );
    return sendSuccess(res, order, 200);
  } catch (err) {
    next(err);
  }
}

export async function handleGetAdminOrders(req, res, next) {
  try {
    const result = await orderService.getAdminOrders(req.query);
    return sendPaginated(res, result.orders, result.page, result.limit, result.total, 200);
  } catch (err) {
    next(err);
  }
}

export async function handleInternalStats(req, res, next) {
  try {
    const stats = await orderService.getStats();
    return sendSuccess(res, stats, 200);
  } catch (err) {
    next(err);
  }
}

export async function handleInternalVendorStats(req, res, next) {
  try {
    const stats = await orderService.getVendorStats(req.params.vendorId);
    return sendSuccess(res, stats, 200);
  } catch (err) {
    next(err);
  }
}

export async function handleInternalCustomerStats(req, res, next) {
  try {
    const stats = await orderService.getCustomerStats(req.params.customerId);
    return sendSuccess(res, stats, 200);
  } catch (err) {
    next(err);
  }
}
