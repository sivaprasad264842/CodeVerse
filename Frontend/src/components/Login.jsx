import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import API from "../api";
import "../CSS/Login.css"

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (searchParams.get("verified") === "true") {
            setMessage({
                text: "Email verified! You can now log in.",
                type: "success",
            });
        }

        if (searchParams.get("already") === "true") {
            setMessage({
                text: "Email already verified. Please log in.",
                type: "success",
            });
        }

        // 🔥 NEW: handle verification error
        if (searchParams.get("error")) {
            setMessage({
                text: "Verification failed or expired",
                type: "error",
            });
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: "", type: "" });
        setLoading(true);

        try {
            const res = await API.post("/auth/login", {
                email,
                password,
            });

            // ✅ store token
            localStorage.setItem("token", res.data.token);

            // 🔥 optional: store user id (if backend sends later)
            // localStorage.setItem("userId", res.data.userId);

            navigate("/home");
        } catch (err) {
            const errorMsg =
                err.response?.data?.msg || // 🔥 FIX HERE
                err.message ||
                "Login failed. Please try again.";

            setMessage({ text: errorMsg, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Welcome Back</h2>

                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-box">
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder=" "
                        />
                        <label>Email</label>
                    </div>

                    <div className="input-box">
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder=" "
                        />
                        <label>Password</label>
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <div className="auth-link">
                    <p>
                        Don't have an account?{" "}
                        <Link to="/register">Register</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
