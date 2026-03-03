import express from "express";
import authRoutes from "./routes/auth.route.js";

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);
app.get('/health', (req, res)=>{
    res.status(200).json({status: "ok"})
})

export default app;