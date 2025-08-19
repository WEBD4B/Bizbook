// Error handling middleware
export function errorHandler(err, req, res, next) {
  console.error('Error Stack:', err.stack);
  
  // Default error
  let error = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500,
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.status = 400;
    error.message = 'Validation Error';
    error.details = err.details;
  }

  if (err.name === 'UnauthorizedError') {
    error.status = 401;
    error.message = 'Unauthorized';
  }

  if (err.code === '23505') { // PostgreSQL unique violation
    error.status = 409;
    error.message = 'Resource already exists';
  }

  if (err.code === '23503') { // PostgreSQL foreign key violation
    error.status = 400;
    error.message = 'Referenced resource does not exist';
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    delete error.stack;
  }

  res.status(error.status).json({
    success: false,
    error: error.message,
    ...(error.details && { details: error.details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

// 404 handler
export function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
}

// Async error wrapper
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
