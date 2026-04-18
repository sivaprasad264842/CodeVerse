import express from "express";
import {
    createProblem,
    getAllProblems,
    getProblemById,
    updateProblem,
    deleteProblem,
} from "../controllers/problemController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isOwner } from "../middleware/isOwner.js";

const router = express.Router();

router.get("/all", getAllProblems);
router.get("/:id", getProblemById);

router.post("/create", authMiddleware, createProblem);

router.put("/:id", authMiddleware, isOwner, updateProblem);
router.delete("/:id", authMiddleware, isOwner, deleteProblem);

export default router;
