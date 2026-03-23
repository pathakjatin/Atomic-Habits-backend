import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";

export async function protect(req, res, next) {
  try {
    // 1. Extract token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("NO_TOKEN", "Authentication required", 401);
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach user to request — never attach password
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      throw new AppError("USER_NOT_FOUND", "User no longer exists", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    // jwt.verify throws its own error types — handle them explicitly
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ code: "INVALID_TOKEN", message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ code: "TOKEN_EXPIRED", message: "Token has expired" });
    }
    if (error.statusCode) {
      return res.status(error.statusCode).json({ code: error.code, message: error.message });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}