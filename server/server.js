import dotenv from 'dotenv';

// Load env variables first to ensure all subsequent imports have access to process.env
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';

// Connect to local MongoDB Database
connectDB();

const PORT = process.env.PORT || 5000;

// Start Server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle global Promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Promise Rejection: ${err.message}`);
  // Shut down server gracefully, then exit
  server.close(() => {
    process.exit(1);
  });
});

// Handle synchronous uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
