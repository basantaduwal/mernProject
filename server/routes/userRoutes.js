import express from 'express';
import { getAllUsers } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get list of users - admin only
router.get('/', protect, admin, getAllUsers);

export default router;
