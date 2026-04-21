import mongoose from "mongoose";

const testCasesSchema = new mongoose.Schema({
    input: String,
    output: String
});

const problemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    statement: { type: String, required: true },
    problemId: { type: String, unique: true },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    testCases:[testCasesSchema],
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Problem", problemSchema);
