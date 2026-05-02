import { useState } from "react";
import { createProblem } from "../api";
import "../CSS/Problem.css";

function CreateProblemModal({ close, refresh }) {
    const [title, setTitle] = useState("");
    const [statement, setStatement] = useState("");
    const [difficulty, setDifficulty] = useState("Easy");
    const [testCases, setTestCases] = useState([{ input: "", output: "" }]);
    const [hints, setHints] = useState([
        { title: "Hint 1", body: "" },
        { title: "Hint 2", body: "" },
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains("modal")) {
            close();
        }
    };

    const handleTestCaseChange = (index, field, value) => {
        setTestCases((current) =>
            current.map((tc, i) =>
                i === index ? { ...tc, [field]: value } : tc,
            ),
        );
    };

    const addTestCase = () => {
        setTestCases((current) => [...current, { input: "", output: "" }]);
    };

    const removeTestCase = (index) => {
        setTestCases((current) =>
            current.length === 1 ? current : current.filter((_, i) => i !== index),
        );
    };

    const handleHintChange = (index, field, value) => {
        setHints((current) =>
            current.map((hint, i) =>
                i === index ? { ...hint, [field]: value } : hint,
            ),
        );
    };

    const addHint = () => {
        setHints((current) => [
            ...current,
            { title: `Hint ${current.length + 1}`, body: "" },
        ]);
    };

    const removeHint = (index) => {
        setHints((current) => current.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!title.trim() || !statement.trim()) {
            setError("Title and statement are required.");
            return;
        }

        if (testCases.some((tc) => !tc.input.trim() || !tc.output.trim())) {
            setError("Every test case needs input and expected output.");
            return;
        }

        if (!localStorage.getItem("token")) {
            setError("Please login before creating a problem.");
            return;
        }

        try {
            setLoading(true);
            await createProblem({
                title: title.trim(),
                statement: statement.trim(),
                difficulty,
                testCases,
                hints: hints.filter((hint) => hint.body.trim()),
            });

            refresh();
            close();
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                setError("Session expired. Please login again.");
            } else {
                setError("Failed to create problem.");
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal" onClick={handleOverlayClick}>
            <form
                className="modal-content problem-form"
                onClick={(e) => e.stopPropagation()}
                onSubmit={handleSubmit}
            >
                <div className="modal-head">
                    <div>
                        <p className="eyebrow">Problem Builder</p>
                        <h2>Create Problem</h2>
                    </div>
                    <button type="button" className="drawer-close" onClick={close}>
                        x
                    </button>
                </div>

                {error && <div className="form-error">{error}</div>}

                <label>
                    Title
                    <input
                        placeholder="Two Sum"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </label>

                <label>
                    Difficulty
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                    >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </label>

                <label>
                    Statement
                    <textarea
                        placeholder="Describe the task, input format, output format, and constraints."
                        value={statement}
                        onChange={(e) => setStatement(e.target.value)}
                    />
                </label>

                <div className="testcase-form-head">
                    <h3>Test Cases</h3>
                    <button type="button" onClick={addTestCase}>
                        Add Case
                    </button>
                </div>

                <div className="testcase-form-list">
                    {testCases.map((tc, index) => (
                        <div className="testcase-editor" key={index}>
                            <div className="case-title">
                                <strong>Case {index + 1}</strong>
                                <button
                                    type="button"
                                    onClick={() => removeTestCase(index)}
                                    disabled={testCases.length === 1}
                                >
                                    Remove
                                </button>
                            </div>
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
                                placeholder="Expected output"
                                value={tc.output}
                                onChange={(e) =>
                                    handleTestCaseChange(
                                        index,
                                        "output",
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                    ))}
                </div>

                <div className="testcase-form-head">
                    <h3>Hints</h3>
                    <button type="button" onClick={addHint}>
                        Add Hint
                    </button>
                </div>

                <div className="testcase-form-list">
                    {hints.map((hint, index) => (
                        <div className="testcase-editor" key={index}>
                            <div className="case-title">
                                <strong>{hint.title || `Hint ${index + 1}`}</strong>
                                <button
                                    type="button"
                                    onClick={() => removeHint(index)}
                                >
                                    Remove
                                </button>
                            </div>
                            <input
                                placeholder={`Hint ${index + 1}`}
                                value={hint.title}
                                onChange={(e) =>
                                    handleHintChange(
                                        index,
                                        "title",
                                        e.target.value,
                                    )
                                }
                            />
                            <textarea
                                placeholder="Small nudge without giving away the full solution"
                                value={hint.body}
                                onChange={(e) =>
                                    handleHintChange(
                                        index,
                                        "body",
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                    ))}
                </div>

                <div className="modal-actions">
                    <button type="button" className="secondary-btn" onClick={close}>
                        Cancel
                    </button>
                    <button type="submit" className="primary-btn" disabled={loading}>
                        {loading ? "Creating..." : "Create"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateProblemModal;
