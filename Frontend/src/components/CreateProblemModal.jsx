import { useState } from "react";
import { createProblem } from "../api";
import "../CSS/Problem.css";

function CreateProblemModal({ close, refresh }) {
    const [title, setTitle] = useState("");
    const [statement, setStatement] = useState("");
    const [testCases, setTestCases] = useState([{ input: "", output: "" }]);
    const [loading, setLoading] = useState(false);

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains("modal")) {
            close();
        }
    };

    const handleTestCaseChange = (index, field, value) => {
        const updated = [...testCases];
        updated[index][field] = value;
        setTestCases(updated);
    };

    const addTestCase = () => {
        setTestCases([...testCases, { input: "", output: "" }]);
    };

    const removeTestCase = (index) => {
        const updated = testCases.filter((_, i) => i !== index);
        setTestCases(updated);
    };

    const handleSubmit = async () => {
        if (!title.trim() || !statement.trim()) {
            alert("All fields are required");
            return;
        }

        if (testCases.some((tc) => !tc.input.trim() || !tc.output.trim())) {
            // clear
            alert("All test cases must have input and output");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login first");
            return;
        }

        try {
            setLoading(true);

            const res = await createProblem({
                title,
                statement,
                testCases,
            });

            console.log("Response:", res.data);

            setTitle("");
            setStatement("");
            setTestCases([{ input: "", output: "" }]);

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
                <h3>Test Cases</h3>
                {testCases.map((tc, index) => (
                    <div key={index}>
                        <textarea
                            placeholder="Input"
                            value={tc.input}
                            onChange={(e) =>
                                handleTestCaseChange(
                                    index,
                                    "input",
                                    e.target.value,
                                )
                            }
                        />
                        <textarea
                            placeholder="Expected Output"
                            value={tc.output}
                            onChange={(e) =>
                                handleTestCaseChange(
                                    index,
                                    "output",
                                    e.target.value,
                                )
                            }
                        />
                        <button onClick={() => removeTestCase(index)}>
                            Remove
                        </button>{" "}
                    </div>
                ))}
                <button onClick={addTestCase}>Add Test Case</button>{" "}
                <button onClick={handleSubmit} disabled={loading}>
                    {loading ? "Submitting..." : "Submit"}
                </button>
                <button onClick={close}>Cancel</button>
            </div>
        </div>
    );
}

export default CreateProblemModal;
