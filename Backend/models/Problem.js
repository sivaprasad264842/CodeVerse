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

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    statement: {
        type: String,
        required: true,
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
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("Problem", problemSchema);
