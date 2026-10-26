import { Router } from 'express';
import { handleInternalStats } from '../controllers/authController.js';
import { requireInternalKey } from '@marketplace/shared';

export const internalRouter = Router();

internalRouter.get('/stats', requireInternalKey, handleInternalStats);
