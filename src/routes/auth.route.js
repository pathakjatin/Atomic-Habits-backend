import express from "express";
import { register , login , getMe, updateProfileHandler, changePasswordHandler, deleteAccountHandler } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();
router.post('/register',authLimiter, register);
router.post('/login', authLimiter, login);

router.get('/me', protect, getMe);
router.patch("/me", protect, updateProfileHandler);
router.patch("/me/password", protect, changePasswordHandler);
router.delete("/me", protect, deleteAccountHandler);

export default router;