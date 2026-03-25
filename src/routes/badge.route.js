// src/routes/badge.route.js
import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getBadges } from "../controllers/badge.controller.js";

const router = Router();

router.use(protect);
router.get("/", getBadges);

export default router;