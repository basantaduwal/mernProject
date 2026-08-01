import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Fetch all registered users in the database
 * Route: GET /api/users
 * Access: Private/Admin
 */
export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({}).select('-password');
  res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
});
