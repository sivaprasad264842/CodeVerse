import Problem from "../models/Problem.js";
import { v4 as uuidv4 } from "uuid";

export const createProblem = async (req, res) => {
    try {
        const { title, statement } = req.body;

        const newProblem = new Problem({
            title,
            statement,
            problemId: uuidv4(),
            createdBy: req.user._id,
        });

        await newProblem.save();
        res.status(201).json(newProblem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllProblems = async (req, res) => {
    const problems = await Problem.find()
        .populate("createdBy", "_id")
        .sort({ createdAt: 1 });
    res.json(problems);
};

export const getProblemById = async (req, res) => {
    const problem = await Problem.findOne({
        problemId: req.params.id,
    }).populate("createdBy", "_id");

    if (!problem) {
        return res.status(404).json({ message: "Problem not found" });
    }

    res.json(problem);
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
        res.status(500).json({ error: err.message });
    }
};
