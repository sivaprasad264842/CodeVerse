import express from "express";
import Problem from "../models/Problem.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

router.post("/create", async (req, res) => {
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
});

router.get("/all", async (req, res) => {
    const problems = await Problem.find().sort({ createdAt: -1 });
    res.json(problems);
});

router.get("/:id", async (req, res) => {
    const problem = await Problem.findOne({ problemId: req.params.id });
    res.json(problem);
});

export default router;
