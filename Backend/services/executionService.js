import axios from "axios";
import os from "os";
import path from "path";
import fs from "fs/promises";
import { spawn } from "child_process";

const EXECUTION_SERVICE_URL =
    process.env.EXECUTION_SERVICE_URL || "http://127.0.0.1:5001/execute";
const ALLOW_LOCAL_EXECUTION_FALLBACK =
    process.env.ALLOW_LOCAL_EXECUTION_FALLBACK === "true";

const TIMEOUT_MS = 2000;

const runProcess = ({ command, args, cwd, input = "" }) =>
    new Promise((resolve) => {
        let stdout = "";
        let stderr = "";
        let timedOut = false;
        let child;

        try {
            child = spawn(command, args, { cwd, shell: false });
        } catch (err) {
            resolve({
                stdout,
                stderr: err.message,
                code: 1,
                timedOut,
            });
            return;
        }

        const timer = setTimeout(() => {
            timedOut = true;
            child.kill("SIGKILL");
        }, TIMEOUT_MS);

        child.stdout.on("data", (chunk) => {
            stdout += chunk.toString();
        });

        child.stderr.on("data", (chunk) => {
            stderr += chunk.toString();
        });

        child.on("error", (err) => {
            clearTimeout(timer);
            resolve({
                stdout,
                stderr: `${stderr}${err.message}`,
                code: 1,
                timedOut,
            });
        });

        child.on("close", (code) => {
            clearTimeout(timer);
            resolve({ stdout, stderr, code, timedOut });
        });

        if (input) {
            child.stdin.write(input);
        }
        child.stdin.end();
    });

const executeCodeLocally = async ({ code, language, input = "" }) => {
    const startedAt = Date.now();
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "oj-"));

    try {
        let result;

        if (language === "javascript") {
            await fs.writeFile(path.join(tmpDir, "main.js"), code, "utf8");
            result = await runProcess({
                command: "node",
                args: ["main.js"],
                cwd: tmpDir,
                input,
            });
        } else if (language === "python") {
            await fs.writeFile(path.join(tmpDir, "main.py"), code, "utf8");
            result = await runProcess({
                command: "python3",
                args: ["main.py"],
                cwd: tmpDir,
                input,
            });
        } else if (language === "cpp") {
            await fs.writeFile(path.join(tmpDir, "main.cpp"), code, "utf8");
            const executable = process.platform === "win32" ? "main.exe" : "main";
            const compile = await runProcess({
                command: "g++",
                args: ["main.cpp", "-o", executable],
                cwd: tmpDir,
            });
            if (compile.code !== 0) {
                return {
                    stdout: compile.stdout,
                    stderr: compile.stderr,
                    status: "compilation_error",
                    time: `${Date.now() - startedAt}ms`,
                };
            }
            result = await runProcess({
                command: process.platform === "win32" ? executable : `./${executable}`,
                args: [],
                cwd: tmpDir,
                input,
            });
        } else if (language === "java") {
            await fs.writeFile(path.join(tmpDir, "Main.java"), code, "utf8");
            const compile = await runProcess({
                command: "javac",
                args: ["Main.java"],
                cwd: tmpDir,
            });
            if (compile.code !== 0) {
                return {
                    stdout: compile.stdout,
                    stderr: compile.stderr,
                    status: "compilation_error",
                    time: `${Date.now() - startedAt}ms`,
                };
            }
            result = await runProcess({
                command: "java",
                args: ["Main"],
                cwd: tmpDir,
                input,
            });
        } else {
            return {
                stdout: "",
                stderr:
                    "Unsupported language in local fallback. Start execution service for this language.",
                status: "runtime_error",
                time: `${Date.now() - startedAt}ms`,
            };
        }

        let status = "success";
        if (result.timedOut) status = "timeout";
        else if (result.code !== 0) status = "runtime_error";

        return {
            stdout: result.stdout,
            stderr: result.stderr,
            status,
            time: `${Date.now() - startedAt}ms`,
        };
    } finally {
        await fs.rm(tmpDir, { recursive: true, force: true });
    }
};

export const executeCode = async (payload) => {
    if (EXECUTION_SERVICE_URL.includes(":5000/")) {
        if (ALLOW_LOCAL_EXECUTION_FALLBACK) {
            return executeCodeLocally(payload);
        }

        return {
            stdout: "",
            stderr:
                "Execution service URL points to the backend server. Start the Docker execution service on port 5001.",
            status: "runtime_error",
            time: "0ms",
        };
    }

    try {
        const res = await axios.post(EXECUTION_SERVICE_URL, payload, {
            timeout: 8000,
        });
        const missingRunnerScript =
            typeof res.data?.stderr === "string" &&
            res.data.stderr.includes("/app/runner.sh: No such file or directory");
        if (missingRunnerScript) {
            console.error(
                "EXECUTION ERROR: Remote runner script path invalid",
            );
            if (ALLOW_LOCAL_EXECUTION_FALLBACK) {
                return executeCodeLocally(payload);
            }

            return {
                stdout: "",
                stderr:
                    "Docker execution service is misconfigured: runner script not found.",
                status: "runtime_error",
                time: "0ms",
            };
        }
        return res.data;
    } catch (err) {
        const serviceError =
            err.response?.data?.error ||
            err.code ||
            err.message ||
            "Unknown execution service error";
        console.error("EXECUTION ERROR:", serviceError);

        if (ALLOW_LOCAL_EXECUTION_FALLBACK) {
            return executeCodeLocally(payload);
        }

        return {
            stdout: "",
            stderr:
                "Docker execution service is not reachable. Start it with Docker and make sure EXECUTION_SERVICE_URL points to http://127.0.0.1:5001/execute.",
            status: "runtime_error",
            time: "0ms",
        };
    }
};
