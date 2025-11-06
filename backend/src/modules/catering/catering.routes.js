import express from 'express';
import CateringController from './catering.controller.js';
import { auth } from '../../middleware/auth.js';
import { validateGetById } from './catering.validation.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET /api/catering-services - Get all active catering services
router.get('/', CateringController.getAll);

// GET /api/catering-services/:id - Get catering service by ID
router.get('/:id', validateGetById, CateringController.getById);

export default router;
