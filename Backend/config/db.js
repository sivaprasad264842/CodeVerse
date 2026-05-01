import mongoose from "mongoose";

mongoose.set("bufferCommands", false);

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("MongoDB connection failed: MONGO_URI is not configured");
            return false;
        }

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
            socketTimeoutMS: 5000,
        });

        console.log("MongoDB Connected");
        return true;
    } catch (err) {
        console.error("MongoDB connection failed:", err.message);
        return false;
    }
};

export default connectDB;
