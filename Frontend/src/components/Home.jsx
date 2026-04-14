import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProblems } from "../api";
import CreateProblemModal from "./CreateProblemModal";
import ProblemCard from "./ProblemCard";
import "../CSS/Home.css";

function Home() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const [problems, setProblems] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const fetchProblems = async () => {
        const res = await getProblems();
        setProblems(res.data);
    };

    useEffect(() => {
        fetchProblems();
    }, []);

    return (
        <div className="home-container">

            <div className="Banner">
                <p className="scroll-text">Welcome to Code with Shiva</p>
            </div>
            <div className="crtbtn">
                <button onClick={() => setShowModal(true)}>
                    + Create Problem
                </button>
            </div>

            {showModal && (
                <CreateProblemModal
                    close={() => setShowModal(false)}
                    refresh={fetchProblems}
                />
            )}

            <div className="problem-list">
                {problems.map((p, index) => (
                    <ProblemCard
                        key={p.problemId}
                        problem={{ ...p, index: index + 1 }}
                    />
                ))}
            </div>

            <div className="home-box">
                <button onClick={handleLogout} className="logout-btn">
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Home;
