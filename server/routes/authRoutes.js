import express from 'express';
import {
  registerUser,
  loginUser,
  googleLogin,
  logoutUser,
  getUserProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  validateRegister,
  validateLogin,
  checkValidationResults,
} from '../validators/authValidator.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, checkValidationResults, registerUser);
router.post('/login', validateLogin, checkValidationResults, loginUser);
router.post('/google', googleLogin);
router.post('/logout', logoutUser);

// Protected routes (require valid JWT)
router.get('/profile', protect, getUserProfile);

export default router;
