import express from "express";
import cors from "cors";
import {
    registerUser,
    verifyUser,
    loginUser,
} from "../controllers/authController.js";

const router = express.Router();
const preflightCors = cors();

router.options("/login", preflightCors);
router.post("/register", registerUser);
router.get("/verify/:token", verifyUser);
router.post("/login", loginUser);

export default router;
