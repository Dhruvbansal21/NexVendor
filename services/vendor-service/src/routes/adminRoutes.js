import { Router } from 'express';
import { handleVerify, handleReject } from '../controllers/vendorController.js';
import { rejectSchema, validateBody } from '../validators/vendorValidator.js';
import { extractUserFromHeaders, requireRole } from '@marketplace/shared';

export const adminVendorRouter = Router();

adminVendorRouter.use(extractUserFromHeaders);
adminVendorRouter.use(requireRole('admin'));

adminVendorRouter.patch('/:id/verify', handleVerify);
adminVendorRouter.patch('/:id/reject', validateBody(rejectSchema), handleReject);
