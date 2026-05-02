import Problem from "../models/Problem.js";
import Submission from "../models/Submission.js";
import User from "../models/User.js";
import { executeCode } from "../services/executionService.js";

export const submitCode = async (req, res) => {
    try {
        const { problemId, code, language } = req.body || {};
        const userId = req.user?._id;
        if (!problemId || !code || !language || !userId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const problem = await Problem.findOne({ problemId });

        if (!problem) {
            return res.status(404).json({ error: "Problem not found" });
        }

        if (!problem.testCases || problem.testCases.length === 0) {
            return res
                .status(400)
                .json({ error: "No test cases found for this problem" });
        }

        let verdict = "Accepted";
        let totalTime = 0;
        let passed = 0;
        let failedTestCase = null;

        for (const [index, tc] of problem.testCases.entries()) {
            const result = await executeCode({
                code,
                language,
                input: tc.input,
            });

            const execTime = Number(result.time?.replace("ms", "")) || 0;
            totalTime += execTime;

            if (result.status === "timeout") {
                verdict = "TLE";
                failedTestCase = {
                    index: index + 1,
                    input: tc.input,
                    expectedOutput: tc.output,
                    actualOutput: result.stdout || "",
                    error: "Time limit exceeded",
                };
                break;
            }

            if (result.status === "compilation_error") {
                verdict = "Compilation Error";
                failedTestCase = {
                    index: index + 1,
                    input: tc.input,
                    expectedOutput: tc.output,
                    actualOutput: result.stdout || "",
                    error: result.stderr || "Compilation error",
                };
                break;
            }

            if (result.status === "runtime_error") {
                verdict = "Runtime Error";
                failedTestCase = {
                    index: index + 1,
                    input: tc.input,
                    expectedOutput: tc.output,
                    actualOutput: result.stdout || "",
                    error: result.stderr || "Runtime error",
                };
                break;
            }

            if ((result.stdout || "").trim() !== (tc.output || "").trim()) {
                verdict = "Wrong Answer";
                failedTestCase = {
                    index: index + 1,
                    input: tc.input,
                    expectedOutput: tc.output,
                    actualOutput: result.stdout || "",
                    error: "",
                };
                break;
            }

            passed++;
        }

        const submission = await Submission.create({
            userId,
            problemId,
            code,
            language,
            verdict,
            executionTime: totalTime,
            passedTestCases: passed,
            totalTestCases: problem.testCases.length,
            failedTestCase,
        });

        if (verdict === "Accepted") {
            await User.findByIdAndUpdate(userId, {
                $addToSet: { solvedProblems: problemId },
            });
        }

        return res.json({
            verdict,
            totalTime,
            passedTestCases: passed,
            totalTestCases: problem.testCases.length,
            failedTestCase,
            submissionId: submission._id,
        });
    } catch (error) {
        console.error("Submit Error:", error.message);
        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
};

export const getMySubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .lean();

        res.json(submissions);
    } catch (error) {
        console.error("Submission history error:", error.message);
        res.status(500).json({ error: "Failed to load submissions" });
    }
};

export const getMyProblemSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({
            userId: req.user._id,
            problemId: req.params.problemId,
        })
            .sort({ createdAt: -1 })
            .lean();

        res.json(submissions);
    } catch (error) {
        console.error("Problem submission history error:", error.message);
        res.status(500).json({ error: "Failed to load submissions" });
    }
};

export const getProblemLeaderboard = async (req, res) => {
    try {
        const rows = await Submission.aggregate([
            { $match: { problemId: req.params.problemId } },
            {
                $group: {
                    _id: "$userId",
                    submissions: { $sum: 1 },
                    accepted: {
                        $sum: {
                            $cond: [{ $eq: ["$verdict", "Accepted"] }, 1, 0],
                        },
                    },
                    bestTime: {
                        $min: {
                            $cond: [
                                { $eq: ["$verdict", "Accepted"] },
                                "$executionTime",
                                999999999,
                            ],
                        },
                    },
                    lastSubmittedAt: { $max: "$createdAt" },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: "$user" },
            {
                $project: {
                    userId: "$_id",
                    submissions: 1,
                    accepted: 1,
                    bestTime: 1,
                    lastSubmittedAt: 1,
                    email: "$user.email",
                    username: "$user.username",
                    bio: "$user.bio",
                    profilePicture: "$user.profilePicture",
                    socialLinks: "$user.socialLinks",
                    phone: "$user.phone",
                    resume: "$user.resume",
                    solvedCount: {
                        $size: { $ifNull: ["$user.solvedProblems", []] },
                    },
                },
            },
            {
                $sort: {
                    accepted: -1,
                    bestTime: 1,
                    submissions: 1,
                    lastSubmittedAt: 1,
                },
            },
            { $limit: 50 },
        ]);

        res.json(
            rows.map((row, index) => ({
                rank: index + 1,
                ...row,
                socialLinks: row.socialLinks || {},
                phone: row.phone || "",
                resume: row.resume || "",
                bestTime: row.bestTime === 999999999 ? null : row.bestTime,
            })),
        );
    } catch (error) {
        console.error("Problem leaderboard error:", error.message);
        res.status(500).json({ error: "Failed to load leaderboard" });
    }
};
