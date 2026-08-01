# Mini Daraz — Manual Testing & Verification Guide 🧪

This document provides a step-by-step guide to manually test and verify every single feature of the **Mini Daraz** monorepo application. You can use this to demonstrate full project functionality to evaluators.

---

## 💻 Frontend URL Features Mapping

| Page URL | Access Level | Key Interactivity to Test |
|---|---|---|
| `/` | Public | Navbar brand logo link, search inputs form, shop redirects. |
| `/products` | Public | Sidebar filter parameters (search keyword, category select, price ranges). |
| `/products/:id` | Public | Detailed specifications, dynamic stock availability indicator, quantity selector, Cart action. |
| `/login` | Public | Auth forms validation, Google OAuth popup trigger, redirect guards. |
| `/register` | Public | Create new account inputs validation. |
| `/profile` | Private | Customer details overview (Name, email address, role, date registered). |
| `/cart` | Customer | Line items table, quantity adjustments, item delete, clear cart, address submission, credit card form. |
| `/orders` | Customer | Order history table, checkout subtotals, shipping destinations, status indicators. |
| `/admin` | Admin | Real-time statistics cards (Total Revenue, orders count, user accounts count). |
| `/admin/products`| Admin | Product catalog table, product creation modal (with file upload), edit modal, delete. |
| `/admin/orders`  | Admin | System orders logs, billing details, progress status selector dropdown. |
| `/admin/users`   | Admin | Registered system users table displaying names, emails, and role badges. |

---

## 🔌 API Endpoints Reference

### 🔐 1. Authentication (`/api/auth`)

#### `POST /api/auth/register` (Public)
* **Body (JSON)**:
  ```json
  {
    "name": "Test Customer",
    "email": "customer@gmail.com",
    "password": "password123"
  }
  ```
* **Verification**: Checks if `token` and `user` are returned. Verify registering duplicates returns `400 User already exists`.

#### `POST /api/auth/login` (Public)
* **Body (JSON)**:
  ```json
  {
    "email": "customer@gmail.com",
    "password": "password123"
  }
  ```
* **Verification**: Verify credentials match, returns token, and sets localStorage data on frontend.

#### `POST /api/auth/google` (Public)
* **Body (JSON)**:
  ```json
  {
    "credential": "GOOGLE_OAUTH_ID_TOKEN"
  }
  ```
* **Verification**: Handles backend Google client-side validation and automatically signs up or signs in the user.

---

### 📦 2. Product Catalog (`/api/products`)

#### `GET /api/products` (Public)
* **Query Parameters**:
  - `?keyword=keyboard`
  - `?category=Electronics`
  - `?minPrice=1000&maxPrice=5000`
* **Verification**: Verify results filter and return appropriate matches.

#### `POST /api/products` (Admin Only)
* **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
* **Body**: `multipart/form-data`
  - `name`: "Wireless Mouse"
  - `description`: "Ergonomic 2.4GHz mouse"
  - `price`: 1200
  - `category`: "Electronics"
  - `stock`: 25
  - `image`: *(File upload attachment)*
* **Verification**: Returns 201 with saved database product object. Verify image is physically written inside `server/uploads/` with a unique timestamp.

#### `PUT /api/products/:id` (Admin Only)
* **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
* **Body**: `multipart/form-data` *(All optional)*
* **Verification**: Modifies entries. If a new image is uploaded, verify the old image is automatically deleted from `server/uploads/` to prevent disk clutter.

#### `DELETE /api/products/:id` (Admin Only)
* **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
* **Verification**: Deletes product from database. Verify the associated product image file is also deleted from `server/uploads/`.

---

### 🛒 3. Cart System (`/api/cart`)

#### `GET /api/cart` (Customer Private)
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Verification**: Returns user's cart. If no cart exists, returns empty array with `totalPrice: 0`.

#### `POST /api/cart` (Customer Private)
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Body (JSON)**:
  ```json
  {
    "productId": "PRODUCT_MONGO_ID",
    "quantity": 2
  }
  ```
* **Verification**: Adds product to cart. Recalculates `totalPrice` by querying live product prices. Incrementing quantity of same product should update the item count instead of duplicating cards.

#### `PUT /api/cart/:productId` (Customer Private)
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Body (JSON)**: `{"quantity": 5}` (Setting `0` should remove item).
* **Verification**: Recalculates total price.

#### `DELETE /api/cart/:productId` (Customer Private)
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Verification**: Removes item from cart and recalculates total.

---

### 🛍️ 4. Checkout & Orders (`/api/orders`)

#### `POST /api/orders` (Customer Private)
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Body (JSON)**:
  ```json
  {
    "shippingAddress": "123 Kathmandu St, Kathmandu, Nepal",
    "paymentMethod": "credit_card"
  }
  ```
* **Verification**: Creates order with status `Pending`. Snapshots current product prices into the order record. Decrements inventory stock for each checked out item. Empties the customer's cart.

#### `POST /api/orders/:id/pay` (Customer Private)
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Verification**: Simulates payment capture. Updates `paymentStatus` to `Paid` and `orderStatus` to `Processing`. Prevents double payment calls on paid orders.

#### `PUT /api/orders/:id/status` (Admin Only)
* **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
* **Body (JSON)**: `{"orderStatus": "Shipped"}` *(Pending, Processing, Shipped, Delivered, Cancelled)*
* **Verification**: Updates order delivery state. Verify status is locked (cannot edit) once marked as `Delivered` or `Cancelled`.

---

## 📝 Manual Testing Walkthrough

Follow this sequence to test the entire application workflow in the browser:

### Step 1: Register Accounts
1. Go to `http://localhost:5173/register` and create a customer account.
2. Open a MongoDB client (Compass or Shell) and verify user account details appear.
3. Register a second account for Admin: go to `/register`, create an account, then in MongoDB directly change their `role` field from `"Customer"` to `"Admin"`.

### Step 2: Admin Dashboard Setup
1. Log in as the Admin user at `/login`.
2. You will be redirected to `/admin` dashboard. Check that initial stats show `0 Revenue` and `0 Orders`.
3. Navigate to `/admin/products` and click **+ Create Product**.
4. Enter test details, attach a `.png` or `.jpg` image, and click **Save Product**.
5. Verify the new product card appears in the list and that the image file is physically saved inside `server/uploads/`.

### Step 3: Customer Catalog Search & Filters
1. Open an incognito browser window (so you are not signed in as Admin) and go to `http://localhost:5173/products`.
2. Verify you see the product created by Admin.
3. Test search filter: type keyword in search bar and press enter. Catalog should update.
4. Test sidebar filters: check categories and enter price thresholds. Click **Apply Filters**.

### Step 4: Cart and Checkout Flow
1. Click on the product card to open the Details page.
2. Select a quantity and click **Add to Cart**. (If you are not logged in, you will be redirected to `/login`).
3. Log in as your Customer user.
4. Verify the Navbar cart icon updates with a count badge. Click the icon to view the Cart.
5. In the cart, test quantity updates and verify total price recalculates.
6. Click **Proceed to Checkout**.
7. Input a delivery address (min 10 characters) and click **Place Order**.

### Step 5: Sandbox Payment Integration
1. After placing the order, verify you are navigated to the **Card Payment** sandbox screen.
2. Input simulated credentials:
   - Card: `4111 2222 3333 4444` (16 digits)
   - Expiry: `12/28` (MM/YY format)
   - CVV: `123` (3 digits)
3. Click **Pay**. Verify order confirmation details display.

### Step 6: Order Logs Auditing
1. Navigate to `/orders` as a customer. Verify order status shows `Paid` and `Processing`.
2. Log back into your Admin session.
3. Go to `/admin/orders` and locate the customer's order.
4. Use the status dropdown to change it from `Processing` to `Shipped`.
5. Return to the Customer session `/orders` page and check that the status immediately updates to `Shipped`.
