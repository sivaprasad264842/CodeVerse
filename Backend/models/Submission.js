import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        problemId: {
            type: String,
            required: true,
            index: true,
        },
        code: {
            type: String,
            required: true,
        },
        language: {
            type: String,
            enum: ["cpp", "java", "python", "javascript"],
            required: true,
        },
        verdict: {
            type: String,
            enum: [
                "Accepted",
                "Wrong Answer",
                "TLE",
                "Runtime Error",
                "Compilation Error",
            ],
            required: true,
        },
        executionTime: Number,
        passedTestCases: {
            type: Number,
            default: 0,
        },
        totalTestCases: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true },
);

export default mongoose.model("Submission", submissionSchema);
