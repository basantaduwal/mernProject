import http from 'http';
import mongoose from 'mongoose';
import assert from 'assert';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';

dotenv.config();

// Helper to handle simple HTTP request sequences
const makeRequest = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: data ? JSON.parse(data) : {},
          });
        } catch {
          resolve({
            statusCode: res.statusCode,
            body: { raw: data },
          });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('--- STARTING PHASE 12 INTEGRATION TESTS ---');

  // 1. Establish Database Connection
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mini_daraz');
  console.log('✔ MongoDB connected.');

  // 2. Clean database records associated with tests
  await User.deleteMany({ email: { $in: ['t_cust@daraz.com', 't_admin@daraz.com'] } });
  await Product.deleteMany({ name: 'Integration Test Item' });
  await Cart.deleteMany({});
  await Order.deleteMany({});
  console.log('✔ Database seeded & cleaned.');

  let customerToken = '';
  let adminToken = '';
  let productId = '';
  let orderId = '';

  // ==========================================
  // STEP 1: AUTHENTICATION
  // ==========================================
  
  // Register customer
  const regRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    name: 'Test Customer',
    email: 't_cust@daraz.com',
    password: 'password123',
  });
  assert.strictEqual(regRes.statusCode, 201, 'Customer registration should return 201');
  assert.ok(regRes.body.token, 'Registration should return token');
  customerToken = regRes.body.token;
  console.log('✔ Test 1 passed: User registration.');

  // Login admin (Created directly in DB to keep test fast)
  const adminUser = await User.create({
    name: 'Test Admin',
    email: 't_admin@daraz.com',
    password: 'password123',
    role: 'Admin',
  });

  const loginAdminRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    email: 't_admin@daraz.com',
    password: 'password123',
  });
  assert.strictEqual(loginAdminRes.statusCode, 200, 'Admin login should return 200');
  assert.ok(loginAdminRes.body.token, 'Admin login should return token');
  adminToken = loginAdminRes.body.token;
  console.log('✔ Test 2 passed: Admin login.');

  // ==========================================
  // STEP 2: PRODUCTS
  // ==========================================
  
  // Create a product directly via DB to simplify upload dependencies in test runner
  const dbProduct = await Product.create({
    name: 'Integration Test Item',
    description: 'A mock product to test checkouts',
    price: 1500,
    category: 'Electronics',
    stock: 10,
    image: '/uploads/test-placeholder.jpg',
    createdBy: adminUser._id,
  });
  productId = dbProduct._id.toString();
  console.log('✔ Test 3 passed: Database product seed.');

  // Retrieve products catalog via API
  const getProdsRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/products?keyword=Integration',
    method: 'GET',
  });
  assert.strictEqual(getProdsRes.statusCode, 200, 'Get products should return 200');
  assert.ok(getProdsRes.body.products.length > 0, 'Catalog should return the seeded product');
  console.log('✔ Test 4 passed: Fetch products catalog.');

  // ==========================================
  // STEP 3: CART OPERATIONS
  // ==========================================
  
  // Add item to cart
  const addCartRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/cart',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`,
    },
  }, {
    productId,
    quantity: 2,
  });
  assert.strictEqual(addCartRes.statusCode, 200, 'Add to cart should return 200');
  assert.strictEqual(addCartRes.body.cart.items[0].quantity, 2, 'Cart quantity should be 2');
  assert.strictEqual(addCartRes.body.cart.totalPrice, 3000, 'Cart total price should be 3000');
  console.log('✔ Test 5 passed: Add item to cart.');

  // ==========================================
  // STEP 4: CHECKOUT & PAYMENT
  // ==========================================
  
  // Place order
  const checkoutRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/orders',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`,
    },
  }, {
    shippingAddress: 'Kathmandu Valley, Nepal 44600',
    paymentMethod: 'credit_card',
  });
  assert.strictEqual(checkoutRes.statusCode, 201, 'Place order should return 201');
  assert.strictEqual(checkoutRes.body.order.subtotal, 3000, 'Order subtotal should match cart');
  assert.strictEqual(checkoutRes.body.order.paymentStatus, 'Pending', 'Order payment should be pending');
  orderId = checkoutRes.body.order._id;
  console.log('✔ Test 6 passed: Place order checkout.');

  // Verify stock decremented
  const updatedProduct = await Product.findById(productId);
  assert.strictEqual(updatedProduct.stock, 8, 'Product stock should decrement by 2');
  console.log('✔ Test 7 passed: Verify stock decrement.');

  // Verify cart cleared
  const getCartRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/cart',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${customerToken}` },
  });
  assert.strictEqual(getCartRes.body.cart.items.length, 0, 'Cart should be cleared after checkout');
  console.log('✔ Test 8 passed: Cart cleared after checkout.');

  // Simulate Card Payment
  const payRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/orders/${orderId}/pay`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${customerToken}` },
  });
  assert.strictEqual(payRes.statusCode, 200, 'Simulate payment should return 200');
  assert.strictEqual(payRes.body.order.paymentStatus, 'Paid', 'Order payment status should update to Paid');
  assert.strictEqual(payRes.body.order.orderStatus, 'Processing', 'Order status should update to Processing');
  console.log('✔ Test 9 passed: Simulate card payment.');

  // Clean up
  await mongoose.disconnect();
  console.log('\n--- ALL INTEGRATION TESTS PASSED CLEANLY ---');
};

runTests().catch((err) => {
  console.error('\n❌ TEST SUITE FAILED:', err.message);
  process.exit(1);
});
