import Problem from "../models/Problem.js";
import Submission from "../models/Submission.js";
import User from "../models/User.js";
import { executeCode } from "../services/executionService.js";

export const submitCode = async (req, res) => {
    try {
        const { problemId, code, language, userId } = req.body;

        if (!problemId || !code || !language || !userId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const problem = await Problem.findById(problemId);

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

        for (const tc of problem.testCases) {
            const result = await executeCode({
                code,
                language,
                input: tc.input,
            });

            const execTime = Number(result.time?.replace("ms", "")) || 0;
            totalTime += execTime;

            if (result.status === "timeout") {
                verdict = "TLE";
                break;
            }

            if (result.status === "compilation_error") {
                verdict = "Compilation Error";
                break;
            }

            if (result.status === "runtime_error") {
                verdict = "Runtime Error";
                break;
            }

            if ((result.stdout || "").trim() !== (tc.output || "").trim()) {
                // clear
                verdict = "Wrong Answer";
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
            submissionId: submission._id,
        });
    } catch (error) {
        console.error("Submit Error:", error);
        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
};
