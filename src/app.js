import express from "express";
import authRoutes from "./routes/auth.route.js";
import habitRoutes from "./routes/habit.route.js";

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.get('/health', (req, res)=>{
    res.status(200).json({status: "ok"})
})

export default app;