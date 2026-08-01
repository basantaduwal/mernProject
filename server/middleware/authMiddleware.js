import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

/**
 * Protect routes by verifying JWT in Authorization header
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB and exclude password field
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new ApiError(401, 'User not found. Authorization failed.'));
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error);
      return next(new ApiError(401, 'Not authorized, token validation failed.'));
    }
  }

  if (!token) {
    return next(new ApiError(401, 'Not authorized, no token provided.'));
  }
};

/**
 * Role-Based Access Control middleware
 * Checks if the user's role is authorized to access the route
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authorized, user credentials missing.'));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Forbidden: Role '${req.user.role}' is not authorized to access this resource.`
        )
      );
    }
    next();
  };
};

/**
 * Shortcut middleware to restrict access to Admin role only
 */
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    return next(new ApiError(403, 'Not authorized as an admin.'));
  }
};

