import mongoose from "mongoose";

const problemSchema = new mongoose.Schema({

    title: { type: String, required: true },
    statement: { type: String, required: true },
    problemId: { type: String, unique: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Problem", problemSchema);