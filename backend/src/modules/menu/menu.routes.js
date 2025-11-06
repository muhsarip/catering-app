import express from 'express';
import MenuController from './menu.controller.js';
import { auth } from '../../middleware/auth.js';
import { validateGetMenuItems, validateGetById } from './menu.validation.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET /api/menu-items - Get all available menu items with optional filters
router.get('/', validateGetMenuItems, MenuController.getAll);

// GET /api/menu-items/:id - Get menu item by ID
router.get('/:id', validateGetById, MenuController.getById);

export default router;
