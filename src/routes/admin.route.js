import { Router } from "express";
import { login, getMetrics, getUserGrowth, getActivityOverTime, getDistributions, getRetentionMetrics } from "../controllers/admin.controller.js";
import { adminAuth } from "../middleware/adminAuth.middleware.js";

const router = Router();

router.post("/login", login);
router.use(adminAuth); // everything below requires admin JWT

router.get("/metrics",      getMetrics);
router.get("/growth",       getUserGrowth);       // ?days=30
router.get("/activity",     getActivityOverTime); // ?days=30
router.get("/distributions", getDistributions);
router.get("/retention", getRetentionMetrics);

export default router;