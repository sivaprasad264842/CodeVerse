import "dotenv/config";
import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import problemRoutes from "./routes/problemRoutes.js";
import codeRoutes from "./routes/codeRoutes.js";

const PORT = process.env.PORT || 5000;
const app = express();
let server;

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

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const startServer = async () => {
    server = app.listen(PORT, () => {
        console.log(`Server running on ${PORT}`);
    });

    server.on("error", (err) => {
        console.error(`Server failed to start: ${err.message}`);
        process.exit(1);
    });

    connectDB().then((dbConnected) => {
        if (!dbConnected) {
            console.warn(
                "API is running without MongoDB. DB-backed routes may fail until MongoDB is reachable.",
            );
        }
    });
};

const shutdown = async (signal) => {
    console.log(`Received ${signal}. Shutting down server...`);

    if (server) {
        server.close(() => {
            console.log("HTTP server closed");
            process.exit(0);
        });
        return;
    }

    process.exit(0);
};

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGUSR2", () => {
    if (server) {
        server.close(() => {
            process.kill(process.pid, "SIGUSR2");
        });
        return;
    }

    process.kill(process.pid, "SIGUSR2");
});

app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/code", codeRoutes);

app.get("/", (req, res) => {
    res.json({ message: "API is Running" });
});

startServer();
