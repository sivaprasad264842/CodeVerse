import Problem from "../models/Problem.js";
import { v4 as uuidv4 } from "uuid";

export const createProblem = async (req, res) => {
    try {
        const { title, statement, testCases } = req.body;
        if (!title || !statement) {
            return res
                .status(400)
                .json({ message: "Title and statement required" });
        }

        const newProblem = new Problem({
            title,
            statement,
            problemId: uuidv4(),
            createdBy: req.user._id,
            testCases: testCases || [],
        });

        await newProblem.save();
        res.status(201).json(newProblem);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

export const getAllProblems = async (req, res) => {
    try {
        const problems = await Problem.find()
            .populate("createdBy", "_id")
            .sort({ createdAt: 1 });
        res.json(problems);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch problems" });
    }
};

export const getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findOne({
            problemId: req.params.id,
        }).populate("createdBy", "_id");

        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        res.json(problem);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch problem" });
    }
};

export const updateProblem = async (req, res) => {
    try {
        const problem = await Problem.findOne({ problemId: req.params.id });

        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        if (problem.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const updated = await Problem.findOneAndUpdate(
            { problemId: req.params.id },
            req.body,
            { new: true },
        );

        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

export const deleteProblem = async (req, res) => {
    try {
        const problem = await Problem.findOne({ problemId: req.params.id });

        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        if (problem.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await Problem.findOneAndDelete({ problemId: req.params.id });

        res.json({ message: "Deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
