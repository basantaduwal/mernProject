import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Instantiate Google Auth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Register a new local customer
 * Route: POST /api/auth/register
 * Access: Public
 */
export const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new ApiError(400, 'User already exists with this email address'));
  }

  // Create User
  const user = await User.create({
    name,
    email,
    password,
  });

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
});

/**
 * Local credential login
 * Route: POST /api/auth/login
 * Access: Public
 */
export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } else {
    return next(new ApiError(401, 'Invalid email or password'));
  }
});

/**
 * Google OAuth Login
 * Route: POST /api/auth/google
 * Access: Public
 */
export const googleLogin = asyncHandler(async (req, res, next) => {
  const token = req.body.token || req.body.idToken || req.body.credential;

  if (!token) {
    return next(new ApiError(400, 'Google token is required'));
  }

  try {
    // Verify client token with Google API
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists by googleId
    let user = await User.findOne({ googleId });

    if (!user) {
      // Fallback: check by email in case user previously registered locally
      user = await User.findOne({ email });

      if (user) {
        // Link Google ID to existing account
        user.googleId = googleId;
        if (!user.avatar || user.avatar === 'default-avatar.png') {
          user.avatar = picture || 'default-avatar.png';
        }
        await user.save();
      } else {
        // Create new Customer account
        user = await User.create({
          name,
          email,
          googleId,
          avatar: picture || 'default-avatar.png',
          role: 'Customer',
        });
      }
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Google verification error:', error);
    return next(new ApiError(401, 'Google authentication failed. Invalid token.'));
  }
});

/**
 * Logout User
 * Route: POST /api/auth/logout
 * Access: Public
 */
export const logoutUser = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
});

/**
 * Get current user profile
 * Route: GET /api/auth/profile
 * Access: Private
 */
export const getUserProfile = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});
