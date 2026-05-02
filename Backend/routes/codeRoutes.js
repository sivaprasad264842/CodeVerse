import express from "express";
import { runCode } from "../controllers/runController.js";
import {
    getMyProblemSubmissions,
    getMySubmissions,
    getProblemLeaderboard,
    submitCode,
} from "../controllers/submitController.js";
import { authMiddleware } from "../middleware/authMiddleware.js"; 
import {
    analyzeCode,
    getAnalysisStatus,
} from "../controllers/analysisController.js";

const router = express.Router();

router.post("/run",authMiddleware, runCode);
router.post("/submit", authMiddleware, submitCode);
router.get("/analyze/status", getAnalysisStatus);
router.post("/analyze", authMiddleware, analyzeCode);
router.get("/submissions/me", authMiddleware, getMySubmissions);
router.get(
    "/submissions/problem/:problemId",
    authMiddleware,
    getMyProblemSubmissions,
);
router.get("/leaderboard/problem/:problemId", getProblemLeaderboard);

export default router;
