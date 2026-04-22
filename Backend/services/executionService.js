import axios from "axios";

export const executeCode = async (payload) => {
    try {
        const res = await axios.post(
            process.env.EXECUTION_SERVICE_URL ||
                "http://execution:5000/execute",
            payload,
            { timeout: 5000 },
        );
        return res.data;
    } catch (err) {
        console.error(err.message);
        throw new Error("Execution service failed");
    }
};
