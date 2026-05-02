import jwt from "jsonwebtoken";
import  AppError  from "../utils/AppError.js";

export const adminAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) throw new AppError("No token", 401);
  try {
    const decoded = jwt.verify(auth.split(" ")[1], process.env.ADMIN_JWT_SECRET);
    if (decoded.role !== "admin") throw new AppError("Forbidden", 403);
    req.admin = decoded;
    next();
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }
};