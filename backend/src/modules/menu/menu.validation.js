import { param, query, validationResult } from 'express-validator';

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
 * Validate get menu items request
 */
export const validateGetMenuItems = [
  query('cateringServiceId')
    .optional()
    .isUUID()
    .withMessage('Invalid catering service ID'),

  query('category')
    .optional()
    .isString()
    .withMessage('Category must be a string')
    .trim(),

  handleValidationErrors,
];

/**
 * Validate get menu item by ID
 */
export const validateGetById = [
  param('id')
    .notEmpty()
    .withMessage('Menu item ID is required')
    .isUUID()
    .withMessage('Invalid menu item ID'),

  handleValidationErrors,
];
