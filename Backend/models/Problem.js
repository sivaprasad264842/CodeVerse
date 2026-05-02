import mongoose from "mongoose";

const testCasesSchema = new mongoose.Schema({
    input: {
        type: String,
        required: true,
    },
    output: {
        type: String,
        required: true,
    },
});

const hintSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        default: "",
    },
    body: {
        type: String,
        trim: true,
        default: "",
    },
});

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    statement: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        default: "Easy",
    },
    problemId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    testCases: {
        type: [testCasesSchema],
        default: [],
    },
    hints: {
        type: [hintSchema],
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("Problem", problemSchema);
