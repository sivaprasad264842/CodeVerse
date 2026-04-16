import { useState } from "react";
import { updateProblem } from "../api";

function EditProblemModal({ problem, close, refresh }) {
    const [title, setTitle] = useState(problem.title);
    const [statement, setStatement] = useState(problem.statement);

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains("modal")) {
            close();
        }
    };

    const handleSubmit = async () => {
        try {
            await updateProblem(problem.problemId, { title, statement });
            refresh();
            close();
        } catch (err) {
            console.error("Error : ", err);
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

                <button onClick={handleSubmit}>Update</button>
                <button onClick={close}>Cancel</button>
            </div>
        </div>
    );
}
export default EditProblemModal;
