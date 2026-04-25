import "dotenv/config";

import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import problemRoutes from "./routes/problemRoutes.js";
import codeRoutes from "./routes/codeRoutes.js";

const app = express();

const allowedOrigins = [
    process.env.CLIENT_URL || "http://localhost:5173",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
];

const corsOptions = {
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

//middlewares
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const startServer = async () => {
    const dbConnected = await connectDB();

    if (!dbConnected) {
        console.warn(
            "Starting API without MongoDB connection. DB-backed routes may fail until DB reconnects.",
        );
    }

    app.listen(PORT, () => {
        console.log(`Server running on ${PORT}`);
    });
};


app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/code", codeRoutes); 

app.get("/", (req, res) => {
    res.json({ message: "API is Running" });
});

const PORT = process.env.PORT || 5000;

startServer();
