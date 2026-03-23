// src/routes/habitLog.routes.js
import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { create, update, getForHabit, getOne } from "../controllers/habitLog.controller.js";

const router = Router({ mergeParams: true });

router.use(protect);

router.post("/", create);
router.get("/", getForHabit);
router.get("/:logId", getOne);
router.patch("/:logId", update);

export default router;