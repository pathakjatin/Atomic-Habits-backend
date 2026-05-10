import express from "express";
import { getProgressReport } from "../controllers/report.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getProgressReport);

export default router;