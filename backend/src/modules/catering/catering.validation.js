import { param, validationResult } from 'express-validator';

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
 * Validate get catering service by ID
 */
export const validateGetById = [
  param('id')
    .notEmpty()
    .withMessage('Catering service ID is required')
    .isUUID()
    .withMessage('Invalid catering service ID'),

  handleValidationErrors,
];
