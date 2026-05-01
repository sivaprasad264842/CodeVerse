import Problem from "../models/Problem.js";

export const isOwner = async (req, res, next) => {
    try {
        const problem = await Problem.findOne({
            problemId: req.params.id,
        }).lean();

        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (problem.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        req.problem = problem;
        next();
    } catch (err) {
        console.error("Owner Check Error:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};
