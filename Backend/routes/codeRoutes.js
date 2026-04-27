import express from "express";
import { runCode } from "../controllers/runController.js";
import { submitCode } from "../controllers/submitController.js";
import { authMiddleware } from "../middleware/authMiddleware.js"; 

const router = express.Router();

router.post("/run",authMiddleware, runCode);
router.post("/submit", authMiddleware, submitCode);

export default router;
