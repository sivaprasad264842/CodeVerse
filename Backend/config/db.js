import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connectionAttempt = mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });

        const timeoutGuard = new Promise((_, reject) => {
            setTimeout(
                () => reject(new Error("MongoDB connection timeout")),
                6000,
            );
        });

        await Promise.race([connectionAttempt, timeoutGuard]);
        console.log("MongoDB Connected");
        return true;
    } catch (err) {
        console.error("MongoDB connection failed:", err.message);
        return false;
    }
};

export default connectDB;
