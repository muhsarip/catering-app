import { body, param, query, validationResult } from 'express-validator';
import {
  validateEmail,
  validatePhone,
  validateOrderStatus,
  validatePaymentMethod,
  validatePaymentStatus,
} from '../../utils/validation.js';

/**
 * Validation middleware handler
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Validate create order request
 */
export const validateCreateOrder = [
  body('customerName')
    .notEmpty()
    .withMessage('Customer name is required')
    .isString()
    .withMessage('Customer name must be a string')
    .trim(),

  body('customerPhone')
    .notEmpty()
    .withMessage('Customer phone is required')
    .custom((value) => {
      if (!validatePhone(value)) {
        throw new Error('Invalid phone number format');
      }
      return true;
    }),

  body('customerEmail')
    .optional()
    .custom((value) => {
      if (value && !validateEmail(value)) {
        throw new Error('Invalid email format');
      }
      return true;
    }),

  body('customerAddress')
    .notEmpty()
    .withMessage('Customer address is required')
    .isString()
    .withMessage('Customer address must be a string')
    .trim(),

  body('cateringServiceId')
    .notEmpty()
    .withMessage('Catering service is required')
    .isUUID()
    .withMessage('Invalid catering service ID'),

  body('menuItems')
    .isArray({ min: 1 })
    .withMessage('At least one menu item is required'),

  body('menuItems.*.menuItemId')
    .notEmpty()
    .withMessage('Menu item ID is required')
    .isUUID()
    .withMessage('Invalid menu item ID'),

  body('menuItems.*.deliveryDate')
    .notEmpty()
    .withMessage('Delivery date is required')
    .isISO8601()
    .withMessage('Invalid delivery date format'),

  body('menuItems.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  body('deliveries')
    .isArray({ min: 1 })
    .withMessage('At least one delivery is required'),

  body('deliveries.*.deliveryDate')
    .notEmpty()
    .withMessage('Delivery date is required')
    .isISO8601()
    .withMessage('Invalid delivery date format'),

  body('deliveries.*.address')
    .notEmpty()
    .withMessage('Delivery address is required')
    .isString()
    .withMessage('Delivery address must be a string')
    .trim(),

  body('deliveries.*.shippingCost')
    .notEmpty()
    .withMessage('Shipping cost is required')
    .isFloat({ min: 0 })
    .withMessage('Shipping cost must be a positive number'),

  body('deliveries.*.timeWindow')
    .optional()
    .isString()
    .withMessage('Time window must be a string')
    .trim(),

  body('paymentMethod')
    .optional()
    .custom((value) => {
      if (value && !validatePaymentMethod(value)) {
        throw new Error('Invalid payment method');
      }
      return true;
    }),

  body('paymentStatus')
    .optional()
    .custom((value) => {
      if (value && !validatePaymentStatus(value)) {
        throw new Error('Invalid payment status');
      }
      return true;
    }),

  handleValidationErrors,
];

/**
 * Validate update status request
 */
export const validateUpdateStatus = [
  param('id')
    .notEmpty()
    .withMessage('Order ID is required')
    .isUUID()
    .withMessage('Invalid order ID'),

  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .custom((value) => {
      if (!validateOrderStatus(value)) {
        throw new Error('Invalid status value');
      }
      return true;
    }),

  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
    .trim(),

  handleValidationErrors,
];

/**
 * Validate get order by ID request
 */
export const validateGetOrderById = [
  param('id')
    .notEmpty()
    .withMessage('Order ID is required')
    .isUUID()
    .withMessage('Invalid order ID'),

  handleValidationErrors,
];

/**
 * Validate get orders list request
 */
export const validateGetOrders = [
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string')
    .trim(),

  query('status')
    .optional()
    .custom((value) => {
      if (value && !validateOrderStatus(value)) {
        throw new Error('Invalid status value');
      }
      return true;
    }),

  query('paymentStatus')
    .optional()
    .custom((value) => {
      if (value && !validatePaymentStatus(value)) {
        throw new Error('Invalid payment status value');
      }
      return true;
    }),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),

  query('sortBy')
    .optional()
    .isIn(['created_at', 'customer_name', 'grand_total', 'order_number'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Invalid sort order'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  handleValidationErrors,
];
