import { useNavigate } from "react-router-dom";

function ProblemCard({ problem }) {
    const navigate = useNavigate();

    return (
        <div
            className="problem-card"
            onClick={() => navigate(`/problem/${problem.problemId}`)}
        >
            { problem.index}. {problem.title}
        </div>
    );
}

export default ProblemCard;
