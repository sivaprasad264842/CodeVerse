import "dotenv/config"; // ✅ loads env automatically

import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import problemRoutes from "./routes/problemRoutes.js";

const app = express();


connectDB();


app.use(express.json());

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    }),
);


app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);

app.get("/", (req, res) => {
    res.json({ message: "API is Running" });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});
