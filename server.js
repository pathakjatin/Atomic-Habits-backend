import dotenv from "dotenv";
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";

dotenv.config();
const PORT = process.env.PORT;

async function startServer(){
    await connectDB();

    app.listen(PORT, ()=>{
        console.log(`Server is running on port ${PORT}`);
    });
}

startServer();