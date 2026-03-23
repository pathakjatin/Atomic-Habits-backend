// src/routes/habit.routes.js
import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { create, getAll, getOne, update, remove } from "../controllers/habit.controller.js";

const router = Router();

router.use(protect); // all habit routes require authentication

router.post("/", create);
router.get("/", getAll);
router.get("/:id", getOne);
router.patch("/:id", update);
router.delete("/:id", remove);

export default router;