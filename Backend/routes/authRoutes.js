import express from "express";
import cors from "cors";
import {
    registerUser,
    verifyUser,
    loginUser,
    getCurrentUser,
    getLeaderboard,
    updateCurrentUser,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
const preflightCors = cors();

router.options("/login", preflightCors);
router.post("/register", registerUser);
router.get("/verify/:token", verifyUser);
router.post("/login", loginUser);
router.get("/leaderboard", getLeaderboard);
router.get("/me", authMiddleware, getCurrentUser);
router.put("/me", authMiddleware, updateCurrentUser);

export default router;
