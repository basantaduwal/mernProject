import express from 'express';
import {
  placeOrder,
  processPayment,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  validatePlaceOrder,
  validateUpdateOrderStatus,
  checkValidationResults,
} from '../validators/orderValidator.js';

const router = express.Router();

// Customer routes (all require JWT)
router.post('/', protect, validatePlaceOrder, checkValidationResults, placeOrder);
router.post('/:id/pay', protect, processPayment);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

// Admin routes
router.get('/', protect, admin, getAllOrders);
router.put(
  '/:id/status',
  protect,
  admin,
  validateUpdateOrderStatus,
  checkValidationResults,
  updateOrderStatus
);

export default router;
