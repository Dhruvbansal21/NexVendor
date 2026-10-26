import fs from 'node:fs';
import * as vendorService from '../services/vendorService.js';
import { sendSuccess, sendPaginated, unauthorized, notFound } from '@marketplace/shared';

export async function handleOnboard(req, res, next) {
  try {
    const userId = req.user?.id || req.headers['x-user-id'];
    if (!userId) {
      return next(unauthorized('Vendor user id missing', 'UNAUTHORIZED'));
    }

    const { storeName, description, contactEmail, contactPhone } = req.body;
    const vendor = await vendorService.onboardVendor({
      userId,
      storeName,
      description,
      contactEmail,
      contactPhone,
      file: req.file
    });

    return sendSuccess(res, vendor, 201);
  } catch (err) {
    next(err);
  }
}

export async function handleGetMe(req, res, next) {
  try {
    const userId = req.user?.id || req.headers['x-user-id'];
    if (!userId) {
      return next(unauthorized('Vendor user id missing', 'UNAUTHORIZED'));
    }
    const vendor = await vendorService.getMyVendor(userId);
    return sendSuccess(res, vendor, 200);
  } catch (err) {
    next(err);
  }
}

export async function handleGetVendors(req, res, next) {
  try {
    const isAdmin = req.user?.role === 'admin' || req.headers['x-user-role'] === 'admin';
    const isPublic = !isAdmin && !req.query.status;

    const result = await vendorService.getVendors({
      status: req.query.status,
      page: req.query.page || 1,
      limit: req.query.limit || 12,
      isPublic
    });

    return sendPaginated(res, result.vendors, result.page, result.limit, result.total, 200);
  } catch (err) {
    next(err);
  }
}

export async function handleGetVendorById(req, res, next) {
  try {
    const requestingUser = req.user?.id ? req.user : (req.headers['x-user-id'] ? {
      id: req.headers['x-user-id'],
      role: req.headers['x-user-role']
    } : null);

    const vendor = await vendorService.getVendorById(req.params.id, requestingUser);
    return sendSuccess(res, vendor, 200);
  } catch (err) {
    next(err);
  }
}

export async function handleVerify(req, res, next) {
  try {
    const vendor = await vendorService.verifyVendor(req.params.id, req.correlationId);
    return sendSuccess(res, vendor, 200);
  } catch (err) {
    next(err);
  }
}

export async function handleReject(req, res, next) {
  try {
    const vendor = await vendorService.rejectVendor(req.params.id, req.body.reason, req.correlationId);
    return sendSuccess(res, vendor, 200);
  } catch (err) {
    next(err);
  }
}

export async function handleStreamKycDoc(req, res, next) {
  try {
    const requestingUser = req.user?.id ? req.user : (req.headers['x-user-id'] ? {
      id: req.headers['x-user-id'],
      role: req.headers['x-user-role']
    } : null);

    const doc = await vendorService.getKycDoc(req.params.id, req.params.docId, requestingUser);
    if (!fs.existsSync(doc.filePath)) {
      return next(notFound('Private KYC document file missing on disk', 'FILE_NOT_FOUND'));
    }

    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${doc.originalName}"`);
    const stream = fs.createReadStream(doc.filePath);
    stream.on('error', (err) => next(err));
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
}

export async function handleInternalGetByUserId(req, res, next) {
  try {
    const vendor = await vendorService.getVendorByUserId(req.params.userId);
    return sendSuccess(res, vendor, 200);
  } catch (err) {
    next(err);
  }
}

export async function handleInternalStats(req, res, next) {
  try {
    const stats = await vendorService.getStats();
    return sendSuccess(res, stats, 200);
  } catch (err) {
    next(err);
  }
}
