/**
 * Express Middleware helper to handle asynchronous errors inside controllers.
 * Passes caught exceptions to the central Express error handler.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
