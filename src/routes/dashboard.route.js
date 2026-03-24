// src/routes/dashboard.routes.js
import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { today, calendarDay, summaries } from "../controllers/dashboard.controller.js";

const router = Router();

router.use(protect);

router.get("/today", today);
router.get("/calendar", calendarDay);
router.get("/summaries", summaries);

export default router;