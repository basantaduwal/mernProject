import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {
  validateCreateProduct,
  validateUpdateProduct,
  checkValidationResults,
} from '../validators/productValidator.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin only routes
router.post(
  '/',
  protect,
  admin,
  upload.single('image'),
  validateCreateProduct,
  checkValidationResults,
  createProduct
);

router.put(
  '/:id',
  protect,
  admin,
  upload.single('image'),
  validateUpdateProduct,
  checkValidationResults,
  updateProduct
);

router.delete('/:id', protect, admin, deleteProduct);

export default router;
