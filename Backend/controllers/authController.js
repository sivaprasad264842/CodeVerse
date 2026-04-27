import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

export const registerUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ msg: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const token = jwt.sign(
            { email, password: hashedPassword },
            process.env.JWT_SECRET,
            { expiresIn: "10m" },
        );

        const verificationLink = `${process.env.CLIENT_URL}/verify/${token}`;

        await sendEmail(
            email,
            "Verify your account",
            `<h2>This is your account confirmation mail,
            click to verify</h2><a href="${verificationLink}">Click here </a> to verify your account </br>
            Thank you `,
        );

        res.json({ msg: "Verification email sent" });
    } catch (err) {
        console.error("Register error:", err.message);
        res.status(500).json({ msg: err.message || "Server error" });
    }
};

export const verifyUser = async (req, res) => {
    try {
        const { token } = req.params;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userExists = await User.findOne({ email: decoded.email });
        if (userExists)
            return res.status(400).json({ msg: "Already verified" });

        const user = new User({
            email: decoded.email,
            password: decoded.password,
        });

        await user.save();

        res.json({ msg: "Account verified successfully" });
    } catch (err) {
        res.status(400).json({ msg: "Invalid or expired token" });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (mongoose.connection.readyState !== 1) {
            return res
                .status(503)
                .json({ msg: "Database unavailable. Try again shortly." });
        }

        if (!email || !password)
            return res.status(400).json({ msg: "Email and password required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid username or password" });


        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ msg: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.json({
            token,
            userId: user._id,
        });
    } catch (err) {
        console.error("Login error:", err.message);
        res.status(500).json({ msg: err.message || "Server error" });
    }
};
