import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.model.js";
import  AppError  from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as adminService from "../services/admin.service.js";

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email }).select("+password");
  if (!admin || !(await admin.comparePassword(password)))
    throw new AppError("Invalid credentials", 401);

  const token = jwt.sign(
    { id: admin._id, role: "admin" },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: "8h" }
  );
  res.json({ token, admin: { id: admin._id, username: admin.username, email: admin.email } });
});

export const getMetrics = asyncHandler(async (req, res) => {
  const metrics = await adminService.aggregateMetrics();
  res.json({ success: true, data: metrics });
});

export const getUserGrowth = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const data = await adminService.getUserGrowthOverTime(Number(days));
  res.json({ success: true, data });
});

export const getActivityOverTime = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const data = await adminService.getLogsOverTime(Number(days));
  res.json({ success: true, data });
});

export const getDistributions = asyncHandler(async (req, res) => {
  const data = await adminService.getDistributions();
  res.json({ success: true, data });
});