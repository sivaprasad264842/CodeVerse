import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProblemById } from "../api";
import "../CSS/Problem.css";

function ProblemPage() {
    const { id } = useParams();
    const [problem, setProblem] = useState(null);

    useEffect(() => {
        getProblemById(id).then((res) => setProblem(res.data));
    }, [id]);

    if (!problem) return <div>Loading...</div>;

    return (
        <div className="container">
            <div className="left">
                <h2>{problem.title}</h2>
                <p>{problem.statement}</p>
            </div>

            <div className="right">
                <h3>Code Editor (Coming Soon)</h3>
            </div>
        </div>
    );
}

export default ProblemPage;
