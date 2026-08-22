/**
 * Global Error Handling Middleware for VendorOS
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error on server for diagnostics
  console.error(`[Error Handler] ${req.method} ${req.originalUrl}:`, err);

  // Mongoose bad ObjectId (CastError)
  if (err.name === "CastError") {
    const message = "Invalid resource identifier format";
    return res.status(400).json({
      success: false,
      message,
    });
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const message = `Duplicate value entered for ${field}`;
    return res.status(400).json({
      success: false,
      message,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    return res.status(400).json({
      success: false,
      message: message || "Validation Error",
    });
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authorization token",
    });
  }

  // Body parser / JSON syntax error
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Malformed JSON payload in request body",
    });
  }

  // Default server error
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  return res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal server error" : (err.message || "Server Error"),
  });
};

module.exports = errorHandler;
