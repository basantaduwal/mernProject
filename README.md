# Mini Daraz 🛍️

Mini Daraz is a full-stack e-commerce application built with the MERN stack for learning and showcasing modern web development practices. It includes user authentication, role-based access, a shopping cart, checkout flow, product management, and an admin dashboard.

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Local-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Vite](https://img.shields.io/badge/Vite-v8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)

---

## 🌐 Live deployment

This project is already deployed in production using:
- Frontend: Vercel
- Backend/API: Render

https://mini-daraz-mern.vercel.app/

# You can check admin dashboard by using admin@gmail.com and pass:admin

---

## ✨ What this project includes

- User registration and login with JWT authentication
- Google OAuth sign-in support
- Product browsing, search, and filtering
- Persistent cart management
- Checkout and order placement flow
- Admin tools for managing products, orders, and users
- Secure API routes and input validation

---

## 🛠️ Tech stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Google OAuth via google-auth-library
- Multer for image uploads
- Helmet, CORS, rate limiting, and validation middleware

### Frontend
- React 19 with Vite
- React Router for navigation
- Tailwind CSS for styling
- Axios for API requests
- Context API for auth and cart state

---

## 🚀 Quick start

### Prerequisites
- Node.js 18+
- npm 9+
- A running MongoDB instance locally

### 1. Clone and install

```bash
git clone https://github.com/basantaduwal/mernProject.git
cd mernProject
npm install
```

### 2. Set up environment variables

Create the backend environment file:

```bash
cp server/.env.example server/.env
```

Example values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mini_daraz
JWT_SECRET=your_strong_secret_here
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Create the frontend environment file:

```bash
cp client/.env.example client/.env
```

Example:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### 3. Create the uploads folder

```bash
mkdir -p server/uploads
```

### 4. Start the app

Run the backend and frontend together:

```bash
npm run dev
```

Or start them separately:

```bash
npm run server:dev
npm run client:dev
```

Open http://localhost:5173 in your browser.

---

## 📁 Project structure

```text
mernProject/
├── client/          # React frontend with Vite
├── server/          # Express API and MongoDB models
├── package.json     # Root scripts and workspace config
└── README.md
```

---

## 🧪 Available scripts

From the project root:

| Script | Purpose |
|---|---|
| `npm run dev` | Start both frontend and backend |
| `npm run server:dev` | Start the backend in development mode |
| `npm run server:start` | Start the backend in production mode |
| `npm run client:dev` | Start the frontend dev server |
| `npm run client:build` | Build the frontend for production |
| `npm test` | Run the server test suite |

---

## 🔐 Roles

- Customer: browse products, manage cart, place orders, and view their own order history
- Admin: access all customer actions plus product, order, and user management

To promote a user to admin, update the user's role to "Admin" in MongoDB.

---

## 🌐 Google OAuth setup

1. Create a project in Google Cloud Console.
2. Enable the Google OAuth API and create a Web OAuth client ID.
3. Add http://localhost:5173 as an authorized origin.
4. Add http://localhost:5173 as an authorized redirect URI.
5. Copy the client ID and secret into the environment files above.

---

## 📄 License

This project is intended for educational and portfolio purposes.