import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.route.js";
import habitRoutes from "./routes/habit.route.js";
import habitLogRouter from "./routes/habitLog.route.js";
import dashboardRouter from "./routes/dashboard.route.js";
import badgeRouter from "./routes/badge.route.js";
import adminRoutes from "./routes/admin.route.js";
import reportRouter from "./routes/report.route.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    "http://localhost:5173",
  ],
  credentials: true,
}));
app.get('/', (req, res)=>{
    res.status(200).json({status: "ok"})
})

app.use('/api/auth', authRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/habits', habitRoutes);
app.use("/api/habits/:habitId/logs", habitLogRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/badges", badgeRouter);
app.use("/api/reports", reportRouter);
app.use(errorHandler);

export default app;