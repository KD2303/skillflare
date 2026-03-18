// Error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error — full details in dev, minimal in production to avoid leaking internals
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  } else {
    console.error(`[${err.name}] ${err.message}`);
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

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
  });
};

export default errorHandler;
