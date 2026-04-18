import { useState } from "react";
import { updateProblem } from "../api";

function EditProblemModal({ problem, close, refresh }) {
    const [title, setTitle] = useState(problem.title);
    const [statement, setStatement] = useState(problem.statement);
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
            alert("Please Login first");
            return;
        }
        try {
            setLoading(true);

            await updateProblem(problem.problemId, { title, statement });
            refresh();
            close();
        } catch (err) {
            if (err.response?.status === 403) {
                alert("You are not allowed to edit this problem");
            } else if (err.response?.status === 401) {
                alert("Session expired. Please login again.");
                localStorage.removeItem("token");
            } else {
                alert("Update failed");
            }

            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal" onClick={handleOverlayClick}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Edit Problem</h2>

                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <textarea
                    value={statement}
                    onChange={(e) => setStatement(e.target.value)}
                />

                <button onClick={handleSubmit} disabled={loading}>
                    {loading ? "Updating..." : "Update"}
                </button>
                <button onClick={close}>Cancel</button>
            </div>
        </div>
    );
}
export default EditProblemModal;
