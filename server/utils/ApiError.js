/**
 * Custom Error Class for API errors
 * Extends the built-in Error class to support HTTP status codes
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Identifies operational errors from programming/unknown errors

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
