import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

export const registerUser = async (req, res) => {
    const { email, password, username } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ msg: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const token = jwt.sign(
            { email, password: hashedPassword, username },
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

        const requestedUsername =
            String(decoded.username || decoded.email.split("@")[0] || "user")
                .trim()
                .slice(0, 32) || "user";
        let username = requestedUsername;
        let suffix = 1;

        while (await User.exists({ username })) {
            username = `${requestedUsername}${suffix}`.slice(0, 40);
            suffix += 1;
        }

        const user = new User({
            email: decoded.email,
            password: decoded.password,
            username,
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
            email: user.email,
            username: user.username,
        });
    } catch (err) {
        console.error("Login error:", err.message);
        res.status(500).json({ msg: err.message || "Server error" });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select(
                "email username bio profilePicture socialLinks phone resume solvedProblems createdAt",
            )
            .lean();

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        res.json({
            userId: user._id,
            email: user.email,
            username: user.username,
            bio: user.bio,
            profilePicture: user.profilePicture,
            socialLinks: user.socialLinks || {},
            phone: user.phone || "",
            resume: user.resume || "",
            solvedProblems: user.solvedProblems || [],
            createdAt: user.createdAt,
        });
    } catch (err) {
        console.error("Profile error:", err.message);
        res.status(500).json({ msg: "Failed to load profile" });
    }
};

const cleanUrl = (value) => {
    if (!value) return "";
    const trimmed = String(value).trim();
    if (!trimmed) return "";

    try {
        const parsed = new URL(trimmed);
        return ["http:", "https:"].includes(parsed.protocol) ? trimmed : "";
    } catch {
        return "";
    }
};

const cleanImageSource = (value) => {
    if (!value) return "";
    const trimmed = String(value).trim();

    if (/^data:image\/(png|jpe?g|webp);base64,/i.test(trimmed)) {
        return trimmed.length <= 1500000 ? trimmed : "";
    }

    return cleanUrl(trimmed);
};

export const updateCurrentUser = async (req, res) => {
    try {
        const { username, bio, profilePicture, socialLinks, phone, resume } =
            req.body || {};
        const cleanUsername = String(username || "").trim().slice(0, 40);

        if (cleanUsername) {
            const existingUsername = await User.findOne({
                _id: { $ne: req.user._id },
                username: cleanUsername,
            }).lean();

            if (existingUsername) {
                return res.status(409).json({ msg: "Username already taken" });
            }
        }

        const update = {
            username: cleanUsername || undefined,
            bio: String(bio || "").trim().slice(0, 240),
            profilePicture: cleanImageSource(profilePicture),
            socialLinks: {
                github: cleanUrl(socialLinks?.github),
                linkedin: cleanUrl(socialLinks?.linkedin),
                website: cleanUrl(socialLinks?.website),
            },
            phone: String(phone || "").trim().slice(0, 24),
            resume: cleanUrl(resume),
        };

        const user = await User.findByIdAndUpdate(req.user._id, update, {
            new: true,
            runValidators: true,
        })
            .select(
                "email username bio profilePicture socialLinks phone resume solvedProblems createdAt",
            )
            .lean();

        res.json({
            userId: user._id,
            email: user.email,
            username: user.username,
            bio: user.bio,
            profilePicture: user.profilePicture,
            socialLinks: user.socialLinks || {},
            phone: user.phone || "",
            resume: user.resume || "",
            solvedProblems: user.solvedProblems || [],
            createdAt: user.createdAt,
        });
    } catch (err) {
        console.error("Profile update error:", err.message);
        res.status(500).json({ msg: "Failed to update profile" });
    }
};

export const getLeaderboard = async (req, res) => {
    try {
        const users = await User.aggregate([
            {
                $project: {
                    email: 1,
                    username: 1,
                    bio: 1,
                    profilePicture: 1,
                    socialLinks: 1,
                    phone: 1,
                    resume: 1,
                    solvedProblems: { $ifNull: ["$solvedProblems", []] },
                    solvedCount: {
                        $size: { $ifNull: ["$solvedProblems", []] },
                    },
                },
            },
            { $sort: { solvedCount: -1, username: 1, email: 1 } },
            { $limit: 50 },
        ]);

        res.json(
            users.map((user, index) => ({
                rank: index + 1,
                userId: user._id,
                email: user.email,
                username: user.username,
                bio: user.bio,
                profilePicture: user.profilePicture,
                socialLinks: user.socialLinks || {},
                phone: user.phone || "",
                resume: user.resume || "",
                solvedCount: user.solvedCount || 0,
                solvedProblems: user.solvedProblems || [],
            })),
        );
    } catch (err) {
        console.error("Leaderboard error:", err.message);
        res.status(500).json({ msg: "Failed to load leaderboard" });
    }
};
