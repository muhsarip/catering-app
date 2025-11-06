import express from 'express';
import OrdersController from './orders.controller.js';
import { auth } from '../../middleware/auth.js';
import {
  validateCreateOrder,
  validateGetOrders,
  validateGetOrderById,
  validateUpdateStatus,
} from './orders.validation.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// POST /api/orders - Create new order
router.post('/', validateCreateOrder, OrdersController.create);

// GET /api/orders - Get all orders with filters
router.get('/', validateGetOrders, OrdersController.getAll);

// GET /api/orders/:id - Get order details
router.get('/:id', validateGetOrderById, OrdersController.getById);

// PATCH /api/orders/:id/status - Update order status
router.patch('/:id/status', validateUpdateStatus, OrdersController.updateStatus);

export default router;
