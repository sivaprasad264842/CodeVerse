import mongoose, { modelNames } from "mongoose";

const submissionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        problemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Problem",
            required: true
        },
        code: {
            type: String,
            required: true
        },
        language: {
            type: String,
            enum: ["cpp", "java", "python", "javascript"],
            required: true
        },
        verdict: {
            type: String,
            enum: [
                "Accepted",
                "Wrong Answer",
                "TLE",
                "Runtime Error",
                "Compiler Error"
            ],
            required: true
        },
        executionTime: Number,
        passedTestCases: {
            type: Number,
            default: 0
        },
        totalTestCases: {
            Type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

export default mongoose.model("Submission", submissionSchema);