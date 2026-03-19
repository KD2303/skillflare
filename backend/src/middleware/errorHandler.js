import logger from "../config/logger.js";

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error with context
  const context = {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userId: req.user?.id,
    statusCode: error.statusCode || 500,
  };

  if (process.env.NODE_ENV === "production") {
    // Log minimal info in production to avoid leaking internals
    logger.error(`[${err.name}] ${err.message}`, err, context);
  } else {
    // Log full details in development
    logger.error(`[${err.name}] ${err.message}`, err, context);
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const duplicateFields = Object.keys(err.keyValue || {});
    const duplicateField =
      duplicateFields.length > 0 ? duplicateFields.join(", ") : "field";
    const message = `Duplicate ${duplicateField} value entered`;
    error = { message, statusCode: 409 };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = { message, statusCode: 401 };
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = { message, statusCode: 401 };
  }

  // Timeout errors
  if (err.name === "TimeoutError" || err.code === "ETIMEDOUT") {
    const message = "Request timeout. Please try again.";
    error = { message, statusCode: 408 };
  }

  // MongoDB connection errors
  if (err.name === "MongoNetworkError" || err.name === "MongoTimeoutError") {
    const message = "Database connection error. Please try again.";
    error = { message, statusCode: 503 };
  }

  // Default to 500 if status code not set
  const statusCode = error.statusCode || 500;

  // Don't expose internal error details to client in production
  const clientMessage =
    process.env.NODE_ENV === "production" && statusCode === 500
      ? "Internal server error"
      : error.message || "Server Error";

  res.status(statusCode).json({
    success: false,
    message: clientMessage,
    ...(process.env.NODE_ENV !== "production" && { error: error.message }),
  });
};

export default errorHandler;
