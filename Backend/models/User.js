import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        solvedProblems: [
            type: mongoose.Schema.Types.ObjectId,
            ref: "Problem"

        ]
    },
    { timestamps: true },
);

export default mongoose.model("User", userSchema);
