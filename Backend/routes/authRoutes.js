import express from "express";
import {
    registerUser,
    verifyUser,
    loginUser,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.get("/verify/:token", verifyUser);
router.post("/login", loginUser);

export default router;
