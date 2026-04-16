import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProblemById, deleteProblem } from "../api";
import EditProblemModal from "./EditProblemModal";
import "../CSS/Problem.css";

function ProblemPage() {
    const { id } = useParams();
    const [problem, setProblem] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const navigate = useNavigate();

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete?")) return;
        try {
            await deleteProblem(id);
            navigate("/home");
        } catch (err) {
            console.error("Error:", err);
        }
    };

    useEffect(() => {
        fetchProblem();
    }, [id]);

    const fetchProblem = async () => {
        const res = await getProblemById(id);
        setProblem(res.data);
    };

    if (!problem) return <div>Loading...</div>;

    return (
        <div className="container">
            <div className="left">
                <h2 className="problemTitle">{problem.title}</h2>
                <p
                    className="problemStatement"
                >
                    {problem.statement}
                </p>

                <div className="action-buttons">
                    <button
                        className="edit-Btn"
                        onClick={() => setEditOpen(true)}
                    >
                        <svg height="1em" viewBox="0 0 512 512">
                            <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231z"></path>
                        </svg>
                    </button>

                    <button className="delete-button" onClick={handleDelete}>
                        <svg
                            className="trash-svg"
                            viewBox="0 -10 64 74"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g id="trash-can">
                                <rect
                                    x="16"
                                    y="24"
                                    width="32"
                                    height="30"
                                    rx="3"
                                    ry="3"
                                ></rect>
                                <g id="lid-group">
                                    <rect
                                        x="12"
                                        y="12"
                                        width="40"
                                        height="6"
                                        rx="2"
                                        ry="2"
                                    ></rect>
                                    <rect
                                        x="26"
                                        y="8"
                                        width="12"
                                        height="4"
                                        rx="2"
                                        ry="2"
                                    ></rect>
                                </g>
                            </g>
                        </svg>
                    </button>
                </div>
            </div>

            <div className="right">
                <h3>Code Editor (Coming Soon)</h3>
            </div>

            {editOpen && (
                <EditProblemModal
                    problem={problem}
                    close={() => setEditOpen(false)}
                    refresh={fetchProblem}
                />
            )}
        </div>
    );
}

export default ProblemPage;
