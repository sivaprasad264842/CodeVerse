import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { deleteProblem } from "../api";
import EditProblemModal from "./EditProblemModal";

function ProblemCard({ problem, refresh, isLoggedIn, onLoginRequired }) {
    const navigate = useNavigate();
    const [editOpen, setEditOpen] = useState(false);

    const userId = localStorage.getItem("userId");
    const ownerId =
        problem.createdBy?._id?.toString() || problem.createdBy?.toString();
    const isOwner = ownerId === userId;
    const difficulty = problem.difficulty || "Easy";
    const caseCount = problem.testCases?.length || 0;

    const handleDelete = async (e) => {
        e.stopPropagation();

        if (!isLoggedIn) {
            onLoginRequired();
            return;
        }

        if (!window.confirm("Delete this problem?")) return;

        try {
            await deleteProblem(problem.problemId);
            refresh();
        } catch (err) {
            console.error("Error:", err);
        }
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        if (!isLoggedIn) {
            onLoginRequired();
            return;
        }
        setEditOpen(true);
    };

    return (
        <>
            <article className="problem-card">
                <button
                    className="card-main"
                    onClick={() => navigate(`/problem/${problem.problemId}`)}
                >
                    <span className="problem-index">
                        {String(problem.index).padStart(2, "0")}
                    </span>
                    <span>
                        <strong>{problem.title}</strong>
                        <small>{caseCount} test cases</small>
                    </span>
                </button>

                <div className="card-meta">
                    <span
                        className={`difficulty-pill ${difficulty.toLowerCase()}`}
                    >
                        {difficulty}
                    </span>
                    <button
                        className="code-button"
                        onClick={() => navigate(`/problem/${problem.problemId}`)}
                    >
                        Code Editor
                    </button>
                    {isOwner && (
                        <>
                            <button className="icon-btn" onClick={handleEdit}>
                                Edit
                            </button>
                            <button
                                className="icon-btn danger"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </article>

            {editOpen && isOwner && (
                <EditProblemModal
                    problem={problem}
                    close={() => setEditOpen(false)}
                    refresh={refresh}
                />
            )}
        </>
    );
}

export default ProblemCard;
