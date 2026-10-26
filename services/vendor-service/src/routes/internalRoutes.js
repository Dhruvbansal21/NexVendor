import { Router } from 'express';
import {
  handleInternalGetByUserId,
  handleGetVendorById,
  handleInternalStats
} from '../controllers/vendorController.js';
import { requireInternalKey } from '@marketplace/shared';

export const internalRouter = Router();

internalRouter.use(requireInternalKey);

internalRouter.get('/by-user/:userId', handleInternalGetByUserId);
internalRouter.get('/:id', handleGetVendorById);
internalRouter.get('/stats/all', handleInternalStats);
internalRouter.get('/stats', handleInternalStats);
