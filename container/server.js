import express from "express";
import { execFile, spawn } from "child_process";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";

const app = express();
const PORT = process.env.PORT || 5001;
const APP_DIR = process.env.APP_DIR || process.cwd();
const TEMP_ROOT = process.env.TEMP_DIR || path.join(APP_DIR, "temp");
const RUNNER_SCRIPT_PATH =
    process.env.RUNNER_SCRIPT_PATH || path.join(APP_DIR, "runner.sh");

app.use(express.json());

const TIMEOUT = 2000;

const runProcess = ({ command, args, cwd, input = "" }) =>
    new Promise((resolve) => {
        let stdout = "";
        let stderr = "";
        let timedOut = false;
        let child;

        try {
            child = spawn(command, args, { cwd, shell: false });
        } catch (err) {
            resolve({ stdout, stderr: err.message, code: 1, timedOut });
            return;
        }

        const timer = setTimeout(() => {
            timedOut = true;
            child.kill("SIGKILL");
        }, TIMEOUT);

        child.stdout.on("data", (chunk) => {
            stdout += chunk.toString();
        });

        child.stderr.on("data", (chunk) => {
            stderr += chunk.toString();
        });

        child.on("error", (err) => {
            clearTimeout(timer);
            resolve({ stdout, stderr: `${stderr}${err.message}`, code: 1, timedOut });
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

const sendDirectResult = async ({ res, language, jobDir, input, startedAt }) => {
    let result;

    if (language === "cpp") {
        const compile = await runProcess({
            command: "g++",
            args: ["code.cpp", "-o", "main.exe"],
            cwd: jobDir,
        });

        if (compile.code !== 0) {
            return res.json({
                stdout: compile.stdout,
                stderr: compile.stderr,
                status: "compilation_error",
                time: `${Date.now() - startedAt}ms`,
            });
        }

        result = await runProcess({
            command: path.join(jobDir, "main.exe"),
            args: [],
            cwd: jobDir,
            input,
        });
    } else if (language === "java") {
        const compile = await runProcess({
            command: "javac",
            args: ["Main.java"],
            cwd: jobDir,
        });

        if (compile.code !== 0) {
            return res.json({
                stdout: compile.stdout,
                stderr: compile.stderr,
                status: "compilation_error",
                time: `${Date.now() - startedAt}ms`,
            });
        }

        result = await runProcess({
            command: "java",
            args: ["Main"],
            cwd: jobDir,
            input,
        });
    } else if (language === "python") {
        result = await runProcess({
            command: "python",
            args: ["code.py"],
            cwd: jobDir,
            input,
        });
    } else {
        result = await runProcess({
            command: "node",
            args: ["code.js"],
            cwd: jobDir,
            input,
        });
    }

    let status = "success";
    if (result.timedOut) status = "timeout";
    else if (result.code !== 0) status = "runtime_error";

    return res.json({
        stdout: result.stdout,
        stderr: result.stderr,
        status,
        time: `${Date.now() - startedAt}ms`,
    });
};

app.post("/execute", async (req, res) => {
    try {
        const { code, input = "", language } = req.body || {};
        const jobId = req.body?.jobId || uuid();

        if (!language || (!code && !req.body?.jobId)) {
            return res
                .status(400)
                .json({ error: "code and language required" });
        }

        const jobDir = path.join(TEMP_ROOT, jobId);
        fs.mkdirSync(jobDir, { recursive: true });
        fs.writeFileSync(path.join(jobDir, "input.txt"), input, "utf8");

        let runCmd = "";
        let sourceFile = "";

        switch (language) {
            case "cpp":
                runCmd = "g++ code.cpp -o main && ./main";
                sourceFile = "code.cpp";
                break;
            case "python":
                runCmd = "python3 code.py";
                sourceFile = "code.py";
                break;
            case "java":
                runCmd =
                    "javac -J-Xms16m -J-Xmx256m -J-XX:ReservedCodeCacheSize=32m -J-XX:CompressedClassSpaceSize=32m -J-XX:MaxMetaspaceSize=128m Main.java && java -Xms16m -Xmx256m -XX:ReservedCodeCacheSize=32m -XX:CompressedClassSpaceSize=32m -XX:MaxMetaspaceSize=128m Main";
                sourceFile = "Main.java";
                break;
            case "javascript":
                runCmd = "node code.js";
                sourceFile = "code.js";
                break;
            default:
                return res.status(400).json({ error: "Unsupported language" });
        }

        if (code) {
            fs.writeFileSync(path.join(jobDir, sourceFile), code, "utf8");
        }

        const start = Date.now();

        if (process.platform === "win32") {
            try {
                await sendDirectResult({
                    res,
                    language,
                    jobDir,
                    input,
                    startedAt: start,
                });
            } finally {
                fs.rmSync(jobDir, { recursive: true, force: true });
            }
            return;
        }

        execFile(
            "bash",
            [RUNNER_SCRIPT_PATH, runCmd],
            {
                cwd: jobDir,
                timeout: TIMEOUT,
            },
            (error, stdout, stderr) => {
                const end = Date.now();

                let status = "success";

                if (error) {
                    if (error.killed) status = "timeout";
                    else status = "runtime_error";
                }

                if (stderr && stderr.toLowerCase().includes("error"))
                    status = "compilation_error";

                res.json({
                    stdout,
                    stderr,
                    status,
                    time: end - start + "ms",
                });

                fs.rmSync(jobDir, { recursive: true, force: true });
            },
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Execution failed" });
    }
});

const server = app.listen(PORT, () =>
    console.log(`Execution service running on ${PORT}`),
);

server.on("error", (err) => {
    console.error(`Execution service failed to start: ${err.message}`);
    process.exit(1);
});

const shutdown = (signal) => {
    console.log(`Received ${signal}. Shutting down execution service...`);
    server.close(() => {
        console.log("Execution service closed");
        process.exit(0);
    });
};

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
