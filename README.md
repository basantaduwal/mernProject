# Mini Daraz 🛍️

> A professional full-stack **MERN** e-commerce application built as a university showcase project — demonstrating clean architecture, role-based access control, JWT authentication with Google OAuth, local image uploads, and a complete customer shopping flow.

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Local-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-v8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)

---

## ✨ Features

| Area | Features |
|---|---|
| **Authentication** | Local register/login, Google OAuth 2.0, JWT tokens, bcrypt password hashing |
| **Authorization** | Role-Based Access Control (Admin / Customer), protected API routes, frontend route guards |
| **Products** | CRUD catalog with Multer local image uploads, search by keyword, filter by category and price range |
| **Cart** | Per-user persistent cart, quantity control, real-time price recalculation |
| **Checkout** | Multi-step wizard: shipping address → simulated card payment → order confirmation |
| **Orders** | Full order lifecycle: Pending → Processing → Shipped → Delivered with admin status override |
| **Admin Dashboard** | Live stats overview, product inventory CRUD, transaction audit, user accounts list |
| **Security** | Helmet, CORS, express-rate-limit, express-validator, JWT verification middleware |

---

## 🏗️ Tech Stack

### Backend (`server/`)
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB (local) + Mongoose ODM
- **Auth**: JWT + Google OAuth (`google-auth-library`)
- **Image Upload**: Multer (disk storage)
- **Validation**: express-validator
- **Security**: Helmet, CORS, express-rate-limit, bcrypt

### Frontend (`client/`)
- **Framework**: React 19 + Vite 8
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS v4
- **HTTP Client**: Axios (with JWT interceptors)
- **State**: Context API (AuthContext + CartContext)
- **Google Auth**: @react-oauth/google

---

## 📁 Project Structure

```
mini-daraz/                          ← Monorepo root (npm workspaces)
├── client/                          ← React frontend (Vite)
│   ├── src/
│   │   ├── components/              ← ProtectedRoute, AdminRoute guards
│   │   ├── context/                 ← AuthContext, CartContext (global state)
│   │   ├── hooks/                   ← useAuth, useCart convenience hooks
│   │   ├── layouts/                 ← MainLayout (Navbar+Footer), AdminLayout (Sidebar)
│   │   ├── pages/                   ← Home, Login, Register, Products, ProductDetails,
│   │   │                               Cart (Checkout Wizard), Orders, Profile
│   │   │                               AdminDashboard, AdminProducts, AdminOrders, AdminUsers
│   │   ├── services/
│   │   │   └── api.js               ← Centralized Axios instance with interceptors
│   │   ├── App.jsx                  ← Router with nested layout routes
│   │   ├── main.jsx                 ← App bootstrap with providers
│   │   └── index.css                ← Global dark design system (Tailwind v4)
│   ├── .env                         ← Frontend env vars (VITE_GOOGLE_CLIENT_ID)
│   └── vite.config.js               ← Vite + Tailwind plugin + API proxy config
│
└── server/                          ← Node.js/Express backend
    ├── config/
    │   └── db.js                    ← MongoDB connection
    ├── controllers/                 ← authController, userController, productController,
    │                                   cartController, orderController
    ├── middleware/                  ← authMiddleware, uploadMiddleware, rateLimiter,
    │                                   errorMiddleware
    ├── models/                      ← User, Product, Cart, Order (Mongoose schemas)
    ├── routes/                      ← authRoutes, userRoutes, productRoutes,
    │                                   cartRoutes, orderRoutes
    ├── utils/                       ← ApiError, asyncHandler, generateToken
    ├── validators/                  ← authValidator, productValidator, orderValidator
    ├── uploads/                     ← Local product image storage (gitignored)
    ├── .env                         ← Server secrets (never committed)
    └── server.js                    ← HTTP server entry point
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | v18 or higher |
| npm | v9 or higher |
| MongoDB | v6+ running locally |

### 1. Clone the Repository

```bash
git clone https://github.com/basantaduwal/mernProject.git
cd mernProject
```

### 2. Install All Dependencies

```bash
npm install
```

> This installs dependencies for both `server/` and `client/` workspaces simultaneously.

### 3. Configure Environment Variables

**Backend** — copy the template and fill in your values:
```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/mini_daraz
JWT_SECRET=your_strong_random_secret_here
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend** — copy the template and fill in your values:
```bash
cp client/.env.example client/.env
```

Edit `client/.env`:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### 4. Create Uploads Directory

```bash
mkdir -p server/uploads
```

### 5. Run Development Servers

**Backend** (Express on port 5000):
```bash
npm run server:dev
```

**Frontend** (Vite on port 5173 — in a second terminal):
```bash
npm run client:dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📜 Available Scripts

Run from the **monorepo root**:

| Script | Description |
|---|---|
| `npm run server:dev` | Start backend in development mode (nodemon) |
| `npm run server:start` | Start backend in production mode |
| `npm run client:dev` | Start Vite frontend dev server |
| `npm run install:all` | Install all workspace dependencies |

---

## 🔌 API Reference

### Authentication — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new customer account |
| `POST` | `/api/auth/login` | Public | Login with email and password |
| `POST` | `/api/auth/google` | Public | Login or register via Google OAuth |
| `GET` | `/api/auth/profile` | Private | Get authenticated user profile |

### Products — `/api/products`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | List products (`?keyword`, `?category`, `?minPrice`, `?maxPrice`) |
| `GET` | `/api/products/:id` | Public | Get single product by ID |
| `POST` | `/api/products` | Admin | Create product (multipart/form-data with `image`) |
| `PUT` | `/api/products/:id` | Admin | Update product |
| `DELETE` | `/api/products/:id` | Admin | Delete product and image file |

### Cart — `/api/cart`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/cart` | Customer | Get current user's cart |
| `POST` | `/api/cart` | Customer | Add item (`productId`, `quantity`) |
| `PUT` | `/api/cart/:productId` | Customer | Update item quantity |
| `DELETE` | `/api/cart/:productId` | Customer | Remove specific item |
| `DELETE` | `/api/cart` | Customer | Clear entire cart |

### Orders — `/api/orders`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/orders` | Customer | Place order from cart (checkout) |
| `POST` | `/api/orders/:id/pay` | Customer | Simulate payment |
| `GET` | `/api/orders/my-orders` | Customer | Get own order history |
| `GET` | `/api/orders/:id` | Customer/Admin | Get single order |
| `GET` | `/api/orders` | Admin | Get all orders |
| `PUT` | `/api/orders/:id/status` | Admin | Update order status |

### Users — `/api/users`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users` | Admin | List all users |
| `GET` | `/api/users/:id` | Admin | Get user by ID |
| `PUT` | `/api/users/:id` | Admin | Update user |
| `DELETE` | `/api/users/:id` | Admin | Delete user |

---

## 🔑 Default Roles

| Role | Capabilities |
|---|---|
| `Customer` | Browse catalog, manage cart, place and view own orders |
| `Admin` | All customer capabilities + product CRUD, order status control, user audits |

> **Create an Admin account**: Register normally, then update the `role` field to `"Admin"` directly in MongoDB.

---

## 🗄️ Data Models

| Model | Key Fields |
|---|---|
| `User` | `name`, `email`, `password` (bcrypt), `role` (Customer/Admin), Google OAuth fields |
| `Product` | `name`, `description`, `price`, `category`, `stock`, `image` (path), `createdBy` |
| `Cart` | `user` (unique), `items[]` (`product`, `quantity`), `totalPrice` |
| `Order` | `user`, `products[]` (price snapshots), `subtotal`, `paymentStatus`, `orderStatus`, `shippingAddress` |

---

## 🌐 Google OAuth Setup

1. Create a project at [Google Cloud Console](https://console.cloud.google.com)
2. Enable **Google+ API** and create an **OAuth 2.0 Client ID** (Web application)
3. Set Authorized Origins: `http://localhost:5173`
4. Set Authorized Redirect URIs: `http://localhost:5173`
5. Copy the **Client ID** and **Client Secret** to your `.env` files

---

## 📄 License

This project is created for educational purposes as part of a university curriculum.

---

<p align="center">
  Built with ❤️ by <strong>Basanta Duwal</strong> — MERN Stack University Showcase
</p>
