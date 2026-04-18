import { useState } from "react";
import { createProblem } from "../api";
import "../CSS/Problem.css";

function CreateProblemModal({ close, refresh }) {
    const [title, setTitle] = useState("");
    const [statement, setStatement] = useState("");
    const [loading, setLoading] = useState(false);

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains("modal")) {
            close();
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !statement.trim()) {
            alert("All fields are required");
            return;
        }
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login first");
            return;
        }

        try {
            setLoading(true);
            const res = await createProblem({ title, statement });
            console.log("Response:", res.data);

            setTitle("");
            setStatement("");
            refresh();
            close();
        } catch (err) {
            if (err.response?.status === 401) {
                alert("Session expired. Please login again.");
                localStorage.removeItem("token");
            } else {
                alert("Failed to create problem ");
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal" onClick={handleOverlayClick}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Create Problem</h2>

                <input
                    placeholder="Problem Name"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <textarea
                    placeholder="Problem Statement"
                    value={statement}
                    onChange={(e) => setStatement(e.target.value)}
                />

                <button onClick={handleSubmit} disabled={loading}>
                    {loading ? "Submitting..." : "Submit"}
                </button>
                <button onClick={close}>Cancel</button>
            </div>
        </div>
    );
}

export default CreateProblemModal;
