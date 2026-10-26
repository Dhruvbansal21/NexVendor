import * as catalogueService from '../services/catalogueService.js';
import { sendSuccess, sendPaginated, unauthorized } from '@marketplace/shared';

export async function handleGetProducts(req, res, next) {
  try {
    const result = await catalogueService.getPublicProducts(req.query);
    return sendPaginated(res, result.products, result.page, result.limit, result.total, 200);
  } catch (err) {
    next(err);
  }
}

export async function handleGetProductById(req, res, next) {
  try {
    const userId = req.headers['x-user-id'];
    const product = await catalogueService.getProductById(req.params.id, userId, req.correlationId);
    return sendSuccess(res, product, 200);
  } catch (err) {
    next(err);
  }
}

export async function handleGetCategories(req, res, next) {
  try {
    const categories = await catalogueService.getCategories();
    return sendSuccess(res, categories, 200);
  } catch (err) {
    next(err);
  }
}

export async function handleGetMyProducts(req, res, next) {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return next(unauthorized('Vendor user id required', 'UNAUTHORIZED'));
    }
    const result = await catalogueService.getVendorProducts(userId, req.query, req.correlationId);
    return sendPaginated(res, result.products, result.page, result.limit, result.total, 200);
  } catch (err) {
    next(err);
  }
}

export async function handleCreateProduct(req, res, next) {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return next(unauthorized('Vendor user id required', 'UNAUTHORIZED'));
    }
    const product = await catalogueService.createProduct(userId, req.body, req.correlationId);
    return sendSuccess(res, product, 201);
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateProduct(req, res, next) {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return next(unauthorized('Vendor user id required', 'UNAUTHORIZED'));
    }
    const product = await catalogueService.updateProduct(userId, req.params.id, req.body, req.correlationId);
    return sendSuccess(res, product, 200);
  } catch (err) {
    next(err);
  }
}

export async function handleDeleteProduct(req, res, next) {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return next(unauthorized('Vendor user id required', 'UNAUTHORIZED'));
    }
    const result = await catalogueService.deleteProduct(userId, req.params.id, req.correlationId);
    return sendSuccess(res, result, 200);
  } catch (err) {
    next(err);
  }
}

export async function handleReserveStock(req, res, next) {
  try {
    const reserved = await catalogueService.reserveStock(req.body.items, req.correlationId);
    return sendSuccess(res, reserved, 200);
  } catch (err) {
    next(err);
  }
}

export async function handleReleaseStock(req, res, next) {
  try {
    const result = await catalogueService.releaseStock(req.body.items, req.correlationId);
    return sendSuccess(res, result, 200);
  } catch (err) {
    next(err);
  }
}

export async function handleSyncVendorStatus(req, res, next) {
  try {
    const result = await catalogueService.syncVendorStatus(req.params.id, req.body, req.correlationId);
    return sendSuccess(res, result, 200);
  } catch (err) {
    next(err);
  }
}

export async function handleInternalStats(req, res, next) {
  try {
    const stats = await catalogueService.getStats();
    return sendSuccess(res, stats, 200);
  } catch (err) {
    next(err);
  }
}
