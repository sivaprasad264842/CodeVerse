import axios from "axios";

const EXECUTION_SERVICE_URL =
    process.env.EXECUTION_SERVICE_URL || "http://127.0.0.1:5001/execute";

const dockerExecutionError = (message) => ({
    stdout: "",
    stderr: message,
    status: "runtime_error",
    time: "0ms",
});

export const executeCode = async (payload) => {
    if (EXECUTION_SERVICE_URL.includes(":5000/")) {
        const message =
            "Execution service URL points to the backend server. Start the Docker execution service on port 5001.";
        console.error("EXECUTION ERROR:", message);
        return dockerExecutionError(message);
    }

    try {
        const res = await axios.post(EXECUTION_SERVICE_URL, payload, {
            timeout: 8000,
        });

        const missingRunnerScript =
            typeof res.data?.stderr === "string" &&
            res.data.stderr.includes("/app/runner.sh: No such file or directory");

        if (missingRunnerScript) {
            const message =
                "Docker execution service is misconfigured: runner script not found.";
            console.error("EXECUTION ERROR:", message);
            return dockerExecutionError(message);
        }

        return res.data;
    } catch (err) {
        const serviceError =
            err.response?.data?.error ||
            err.code ||
            err.message ||
            "Unknown execution service error";

        const message = `Docker execution service failed: ${serviceError}`;
        console.error("EXECUTION ERROR:", message);

        return dockerExecutionError(
            `${message}. Start it with Docker and make sure EXECUTION_SERVICE_URL points to http://127.0.0.1:5001/execute.`,
        );
    }
};
