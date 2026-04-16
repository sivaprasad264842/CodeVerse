import Problem from "../models/Problem.js";
import { v4 as uuidv4 } from "uuid";

export const createProblem = async (req, res) => {
    try {
        const { title, statement } = req.body;

        const newProblem = new Problem({
            title,
            statement,
            problemId: uuidv4(),
        });

        await newProblem.save();
        res.status(201).json(newProblem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllProblems = async (req, res) => {
    const problems = await Problem.find().sort({ createdAt: 1 });
    res.json(problems);
};

export const getProblemById = async (req, res) => {
    const problem = await Problem.findOne({ problemId: req.params.id });
    res.json(problem);
};

export const updateProblem = async (req, res) => {
    const updated = await Problem.findOneAndUpdate(
        { problemId: req.params.id },
        req.body,
        { new: true },
    );
    res.json(updated);
};

export const deleteProblem = async (req, res) => {
    await Problem.findOneAndDelete({ problemId: req.params.id });
    res.json({ message: "Deleted" });
};
