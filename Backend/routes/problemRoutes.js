import express from "express";
import {
    createProblem,
    getAllProblems,
    getProblemById,
    updateProblem,
    deleteProblem,
} from "../controllers/problemController.js";

const router = express.Router();

router.post("/create", createProblem);
router.get("/all", getAllProblems);
router.get("/:id", getProblemById);
router.put("/:id", updateProblem);
router.delete("/:id", deleteProblem);

export default router;
