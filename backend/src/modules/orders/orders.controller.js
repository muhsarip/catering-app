import OrdersService from './orders.service.js';
import OrdersTransformer from './orders.transformer.js';
import { successResponse, errorResponse } from '../../shared/helpers/response.js';

const ordersService = new OrdersService();
const ordersTransformer = new OrdersTransformer();

class OrdersController {
  /**
   * Create a new order
   * POST /api/orders
   */
  async create(req, res, next) {
    try {
      const userId = req.user.id;
      const orderData = req.body;

      const order = await ordersService.createOrder(orderData, userId);

      return successResponse(
        res,
        { order: ordersTransformer.order(order) },
        'Order created successfully',
        201
      );
    } catch (error) {
      if (error.message.includes('not found')) {
        return errorResponse(res, error.message, 404);
      }
      next(error);
    }
  }

  /**
   * Get all orders with filters
   * GET /api/orders
   */
  async getAll(req, res, next) {
    try {
      const filters = req.query;

      const result = await ordersService.getOrders(filters);

      return successResponse(res, {
        orders: ordersTransformer.ordersList(result.orders),
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order by ID
   * GET /api/orders/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const orderData = await ordersService.getOrderById(id);

      return successResponse(
        res,
        ordersTransformer.orderDetails(orderData)
      );
    } catch (error) {
      if (error.message === 'Order not found') {
        return errorResponse(res, error.message, 404);
      }
      next(error);
    }
  }

  /**
   * Update order status
   * PATCH /api/orders/:id/status
   */
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const userId = req.user.id;

      const updatedOrder = await ordersService.updateOrderStatus(
        id,
        status,
        userId,
        notes
      );

      return successResponse(
        res,
        { order: ordersTransformer.order(updatedOrder) },
        'Order status updated successfully'
      );
    } catch (error) {
      if (error.message === 'Order not found') {
        return errorResponse(res, error.message, 404);
      }
      if (error.message.includes('Invalid status transition')) {
        return errorResponse(res, error.message, 400);
      }
      next(error);
    }
  }
}

export default new OrdersController();
