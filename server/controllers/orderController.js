import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Place a new order from the current cart (Checkout)
 * Route: POST /api/orders
 * Access: Private/Customer
 */
export const placeOrder = asyncHandler(async (req, res, next) => {
  const { shippingAddress } = req.body;

  // Fetch user's cart with populated product prices
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    'items.product',
    'name price stock'
  );

  if (!cart || cart.items.length === 0) {
    return next(new ApiError(400, 'Your cart is empty. Add items before placing an order.'));
  }

  // Build order product snapshots and verify stock availability
  const orderProducts = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const product = item.product;

    if (!product) {
      return next(new ApiError(404, 'One or more products in your cart no longer exist.'));
    }

    if (product.stock < item.quantity) {
      return next(
        new ApiError(400, `Insufficient stock for "${product.name}". Available: ${product.stock}`)
      );
    }

    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;

    orderProducts.push({
      product: product._id,
      quantity: item.quantity,
      price: product.price, // Snapshot price at time of order
    });
  }

  subtotal = Math.round(subtotal * 100) / 100;

  // Create the order
  const order = await Order.create({
    user: req.user._id,
    products: orderProducts,
    subtotal,
    shippingAddress,
    paymentStatus: 'Pending',
    orderStatus: 'Pending',
  });

  // Decrement product stock for each ordered item
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { stock: -item.quantity },
    });
  }

  // Clear the cart after successful order placement
  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();

  // Return the populated order
  const populatedOrder = await Order.findById(order._id)
    .populate('user', 'name email')
    .populate('products.product', 'name price image');

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    order: populatedOrder,
  });
});

/**
 * Simulate payment processing for an order
 * Route: POST /api/orders/:id/pay
 * Access: Private/Customer
 */
export const processPayment = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ApiError(404, 'Order not found'));
  }

  // Ensure the order belongs to the current user
  if (order.user.toString() !== req.user._id.toString()) {
    return next(new ApiError(403, 'Not authorized to pay for this order'));
  }

  if (order.paymentStatus === 'Paid') {
    return next(new ApiError(400, 'This order has already been paid'));
  }

  // Simulate successful payment (fake payment gateway)
  order.paymentStatus = 'Paid';
  order.orderStatus = 'Processing';
  await order.save();

  const updatedOrder = await Order.findById(order._id)
    .populate('user', 'name email')
    .populate('products.product', 'name price image');

  res.status(200).json({
    success: true,
    message: 'Payment processed successfully (simulated)',
    order: updatedOrder,
  });
});

/**
 * Get orders belonging to the logged-in customer
 * Route: GET /api/orders/my-orders
 * Access: Private/Customer
 */
export const getMyOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('products.product', 'name price image')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    orders,
  });
});

/**
 * Get a single order by ID
 * Route: GET /api/orders/:id
 * Access: Private (Customer sees own orders only, Admin sees all)
 */
export const getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('products.product', 'name price image category');

  if (!order) {
    return next(new ApiError(404, 'Order not found'));
  }

  // Customers can only view their own orders
  if (
    req.user.role !== 'Admin' &&
    order.user._id.toString() !== req.user._id.toString()
  ) {
    return next(new ApiError(403, 'Not authorized to view this order'));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

/**
 * Get all orders in the system (Admin only)
 * Route: GET /api/orders
 * Access: Private/Admin
 */
export const getAllOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({})
    .populate('user', 'name email')
    .populate('products.product', 'name price')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    orders,
  });
});

/**
 * Update the status of an order (Admin only)
 * Route: PUT /api/orders/:id/status
 * Access: Private/Admin
 */
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { orderStatus } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ApiError(404, 'Order not found'));
  }

  // Prevent updating already delivered or cancelled orders
  if (order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled') {
    return next(
      new ApiError(400, `Cannot update a ${order.orderStatus} order`)
    );
  }

  order.orderStatus = orderStatus;
  await order.save();

  const updatedOrder = await Order.findById(order._id)
    .populate('user', 'name email')
    .populate('products.product', 'name price');

  res.status(200).json({
    success: true,
    message: `Order status updated to '${orderStatus}'`,
    order: updatedOrder,
  });
});
