import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Helper: Recalculate cart total by populating product prices
 * @param {Object} cart - Mongoose cart document
 * @returns {number} Updated total price
 */
const recalculateTotal = async (cart) => {
  // Populate product prices for each item
  await cart.populate('items.product', 'price');
  const total = cart.items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);
  return Math.round(total * 100) / 100; // Round to 2 decimal places
};

/**
 * Get the authenticated user's cart
 * Route: GET /api/cart
 * Access: Private/Customer
 */
export const getCart = asyncHandler(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate(
    'items.product',
    'name price image category stock'
  );

  // If no cart exists, return an empty cart structure
  if (!cart) {
    return res.status(200).json({
      success: true,
      cart: { user: req.user._id, items: [], totalPrice: 0 },
    });
  }

  res.status(200).json({
    success: true,
    cart,
  });
});

/**
 * Add a product to the cart (or increment quantity if already present)
 * Route: POST /api/cart
 * Access: Private/Customer
 */
export const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return next(new ApiError(400, 'Product ID is required'));
  }

  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1) {
    return next(new ApiError(400, 'Quantity must be a positive integer'));
  }

  // Verify product exists and has sufficient stock
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ApiError(404, 'Product not found'));
  }

  // Find or create the user's cart
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [], totalPrice: 0 });
  }

  // Check if product already in cart
  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingItemIndex > -1) {
    // Increment quantity of existing item
    cart.items[existingItemIndex].quantity += qty;
  } else {
    // Add new item
    cart.items.push({ product: productId, quantity: qty });
  }

  // Recalculate total and save
  cart.totalPrice = await recalculateTotal(cart);
  await cart.save();

  // Return populated cart
  await cart.populate('items.product', 'name price image category stock');

  res.status(200).json({
    success: true,
    message: 'Item added to cart',
    cart,
  });
});

/**
 * Update the quantity of a specific cart item
 * Route: PUT /api/cart/:productId
 * Access: Private/Customer
 */
export const updateCartItem = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined || quantity === null) {
    return next(new ApiError(400, 'Quantity is required'));
  }

  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 0) {
    return next(new ApiError(400, 'Quantity must be a non-negative integer'));
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ApiError(404, 'Cart not found'));
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    return next(new ApiError(404, 'Product not found in cart'));
  }

  if (qty === 0) {
    // Remove item if quantity set to 0
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = qty;
  }

  // Recalculate total and save
  cart.totalPrice = await recalculateTotal(cart);
  await cart.save();

  await cart.populate('items.product', 'name price image category stock');

  res.status(200).json({
    success: true,
    message: 'Cart item updated',
    cart,
  });
});

/**
 * Remove a specific product from the cart
 * Route: DELETE /api/cart/:productId
 * Access: Private/Customer
 */
export const removeCartItem = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ApiError(404, 'Cart not found'));
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    return next(new ApiError(404, 'Product not found in cart'));
  }

  cart.items.splice(itemIndex, 1);

  // Recalculate total and save
  cart.totalPrice = await recalculateTotal(cart);
  await cart.save();

  await cart.populate('items.product', 'name price image category stock');

  res.status(200).json({
    success: true,
    message: 'Item removed from cart',
    cart,
  });
});

/**
 * Clear all items from the cart
 * Route: DELETE /api/cart
 * Access: Private/Customer
 */
export const clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return res.status(200).json({
      success: true,
      message: 'Cart is already empty',
    });
  }

  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();

  res.status(200).json({
    success: true,
    message: 'Cart cleared successfully',
    cart,
  });
});
