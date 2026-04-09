import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

export const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        //if user already exist in my DB
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        //we are hashing the password
        const hashedPassword = await bcrypt.hash(password, 10);

        //creating JWT token
        const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });

        const user = await user.create({
            email,
            password: hashedPassword,
            verificationToken,
        });

        const verifyLink = `http://localhost:5000/api/auth/verify/${verificationToken}`;

        await sendEmail(email, "verify Email", verifyLink);

        res.json({ message: "Verification email sent" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        //decoding the JWT token here
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await user.findOne({ email: decoded.email });

        if (!user) return res.status(400).json({ message: "Invalid Token" });

        user.isVerified = true;
        user.verificationToken = null;

        await user.save();

        res.redirect("http://localhost:3000/login");

    } catch (err) {
        res.status(400).json({ message: "Invalid or expired token" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found with this email" });

        if (!user.isVerified) {
            return res.status(400).json({ message: "Pease verify your email" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ tokan });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};