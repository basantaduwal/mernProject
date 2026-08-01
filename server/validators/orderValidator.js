import { body, validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Validator rules for placing an order (checkout)
 */
export const validatePlaceOrder = [
  body('shippingAddress')
    .trim()
    .notEmpty()
    .withMessage('Shipping address is required')
    .isLength({ min: 10 })
    .withMessage('Please provide a complete shipping address (min 10 characters)'),
  body('paymentMethod')
    .trim()
    .notEmpty()
    .withMessage('Payment method is required'),
];

/**
 * Validator rules for admin updating order status
 */
export const validateUpdateOrderStatus = [
  body('orderStatus')
    .trim()
    .notEmpty()
    .withMessage('Order status is required')
    .isIn(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'])
    .withMessage('Invalid order status. Must be one of: Pending, Processing, Shipped, Delivered, Cancelled'),
];

/**
 * Middleware to check results of validation rules
 */
export const checkValidationResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg).join(', ');
    return next(new ApiError(400, errorMessages));
  }
  next();
};
