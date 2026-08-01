import jwt from 'jsonwebtoken';

/**
 * Generates a signed JSON Web Token (JWT) with the user ID as payload
 * @param {string} id - The MongoDB user document ID
 * @returns {string} Signed JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export default generateToken;
