import { Router } from 'express';
import {
  handleOnboard,
  handleGetMe,
  handleGetVendors,
  handleGetVendorById,
  handleStreamKycDoc
} from '../controllers/vendorController.js';
import { onboardSchema, validateBody } from '../validators/vendorValidator.js';
import { kycUpload } from '../config/upload.js';
import { extractUserFromHeaders } from '@marketplace/shared';

export const vendorRouter = Router();

vendorRouter.use(extractUserFromHeaders);

// Onboarding with multipart upload
vendorRouter.post('/onboard', kycUpload.single('kycDoc'), validateBody(onboardSchema), handleOnboard);

// Vendor personal profile
vendorRouter.get('/me', handleGetMe);

// Stream private KYC document
vendorRouter.get('/:id/kyc/:docId', handleStreamKycDoc);
vendorRouter.get('/:id/kyc', handleStreamKycDoc);

// Public / filtered list of vendors
vendorRouter.get('/', handleGetVendors);

// Single vendor profile
vendorRouter.get('/:id', handleGetVendorById);
