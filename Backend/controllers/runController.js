import { executeCode } from "../services/executionService";

export const runCode = async (req, res) => {
    try {
        const result = await executeCode(req.body);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: "Execution failed" });
    }
};