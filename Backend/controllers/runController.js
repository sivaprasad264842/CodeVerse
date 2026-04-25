import { executeCode } from "../services/executionService.js";

export const runCode = async (req, res) => {
    try {
        const { code, language, input } = req.body || {};

        if (!code || !language) {
            return res.status(400).json({
                error: "Code and language required",
            });
        }

        const result = await executeCode({
            code,
            language,
            input,
        });

        res.json(result);
    } catch (err) {
        console.error(err, "Run Code Error check your code and try again");
        res.status(500).json({
            error: err.message || "Run failed",
        });
    }
};
