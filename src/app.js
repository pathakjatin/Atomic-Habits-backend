import express from "express";
import authRoutes from "./routes/auth.route.js";
import habitRoutes from "./routes/habit.route.js";
import habitLogRouter from "./routes/habitLog.route.js";
import dashboardRouter from "./routes/dashboard.route.js";
import badgeRouter from "./routes/badge.route.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();
app.use(express.json());

app.get('/health', (req, res)=>{
    res.status(200).json({status: "ok"})
})

app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use("/api/habits/:habitId/logs", habitLogRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/badges", badgeRouter);
app.use(errorHandler);

export default app;