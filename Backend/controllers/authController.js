import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

// REGISTER (send verification email)
export const registerUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ msg: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        // create token with user data (NOT storing yet)
        const token = jwt.sign(
            { email, password: hashedPassword },
            process.env.JWT_SECRET,
            { expiresIn: "10m" },
        );

        const verificationLink = `${process.env.CLIENT_URL}/verify/${token}`;

        await sendEmail(
            email,
            "Verify your account",
            `<h2>Click to verify</h2><a href="${verificationLink}">Verify Account</a>`,
        );

        res.json({ msg: "Verification email sent" });
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
};

// VERIFY EMAIL
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

// LOGIN
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ msg: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });

        res.json({ token });
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
};
