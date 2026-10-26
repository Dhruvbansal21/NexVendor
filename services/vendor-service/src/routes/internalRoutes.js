import { Router } from 'express';
import {
  handleInternalGetByUserId,
  handleInternalGetById,
  handleInternalStats
} from '../controllers/vendorController.js';
import { requireInternalKey } from '@marketplace/shared';

export const internalRouter = Router();

internalRouter.use(requireInternalKey);

internalRouter.get('/stats', handleInternalStats);
internalRouter.get('/stats/all', handleInternalStats);
internalRouter.get('/by-user/:userId', handleInternalGetByUserId);
internalRouter.get('/:id', handleInternalGetById);
