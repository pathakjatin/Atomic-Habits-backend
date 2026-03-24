// src/middleware/error.middleware.js
export function errorHandler(err, req, res, next) {
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
    });
  }
  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
}