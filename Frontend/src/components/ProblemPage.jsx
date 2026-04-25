import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { getProblemById, deleteProblem, runCode, submitCode } from "../api";
import EditProblemModal from "./EditProblemModal";
import "../CSS/Problem.css";

function ProblemPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [problem, setProblem] = useState(null);
    const [editOpen, setEditOpen] = useState(false);

    const userId = localStorage.getItem("userId");

    const defaultCode = {
        javascript: "// write JavaScript code here",
        python: "# write Python code here",
        cpp: "#include <iostream>\nusing namespace std;\nint main() {\n\n    return 0;\n}",
        java: "public class Main {\n    public static void main(String[] args) {\n\n    }\n}",
    };

    const [language, setLanguage] = useState("javascript");
    const [code, setCode] = useState(defaultCode["javascript"]);
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [verdict, setVerdict] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProblem();
    }, [id]);

    const fetchProblem = async () => {
        try {
            const res = await getProblemById(id);
            setProblem(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    if (!problem) return <div>Loading...</div>;

    const ownerId =
        problem.createdBy?._id?.toString() || problem.createdBy?.toString();

    const isOwner = ownerId === userId;

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete?")) return;
        try {
            await deleteProblem(id);
            navigate("/home");
        } catch (err) {
            console.error("Error:", err);
        }
    };


    const handleRun = async () => {
        setLoading(true);
        setOutput("");
        setVerdict("");

        try {
            const res = await runCode({ code, language, input });
            setOutput(res.data.stdout || res.data.stderr);
        } catch (err) {
            console.error(err);
            const message =
                err.response?.data?.error ||
                err.response?.data?.message ||
                err.message ||
                "Error running code";
            setOutput(message);
        } finally {
            setLoading(false);
        }
    };

    
    const handleSubmit = async () => {
        setLoading(true);
        setVerdict("");

        try {
            const res = await submitCode({
                problemId: problem.problemId,
                code,
                language,
                userId,
            });

            setVerdict(res.data.verdict);
        } catch (err) {
            console.error(err);
            setVerdict("Submission failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="left">
                <h2 className="problemTitle">{problem.title}</h2>
                <p className="problemStatement">{problem.statement}</p>

                <div className="action-buttons">
                    {isOwner && (
                        <>
                            <button
                                className="edit-Btn"
                                onClick={() => setEditOpen(true)}
                            >
                                Edit
                            </button>

                            <button
                                className="delete-button"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="right">
                <div className="editor-controls">
                    <select
                        value={language}
                        onChange={(e) => {
                            setLanguage(e.target.value);
                            setCode(defaultCode[e.target.value]);
                        }}
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                    </select>

                    <button onClick={handleRun}>Run</button>
                    <button onClick={handleSubmit}>Submit</button>
                </div>

                <Editor
                    height="400px"
                    language={language}
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    theme="vs-dark"
                />

                <textarea
                    placeholder="Custom Input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />

                <div className="output">
                    {loading && <p>Running...</p>}

                    {output && (
                        <>
                            <h4>Output:</h4>
                            <pre>{output}</pre>
                        </>
                    )}

                    {verdict && (
                        <>
                            <h4>Verdict:</h4>
                            <p>{verdict}</p>
                        </>
                    )}
                </div>
            </div>

            {editOpen && isOwner && (
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
