import { useState } from "react";
import { createProblem } from "../api";

function CreateProblemModal({ close, refresh }) {
    const [title, setTitle] = useState("");
    const [statement, setStatement] = useState("");

    const handleSubmit = async () => {
        console.log("Clicked");
        try {
            const res = await createProblem({ title, statement });
            console.log("Response: ", res.data);
            refresh();
            close();
        } catch (err) {
            console.error("Eroor: ", err)
        }
        
        
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Create Problem</h2>

                <input
                    placeholder="Problem Name"
                    onChange={(e) => setTitle(e.target.value)}
                />

                <textarea
                    placeholder="Problem Statement"
                    onChange={(e) => setStatement(e.target.value)}
                />

                <button onClick={handleSubmit}>Submit</button>
                <button onClick={close}>Cancel</button>
            </div>
        </div>
    );
}

export default CreateProblemModal;
