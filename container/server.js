import express from "express";
import { exec } from "child_process";
import fs from "fs";
import { v4 as uuid } from "uuid";

const app = express();

app.use(express.json());

const TIMEOUT = 2;

app.post("/execute", async (req, res) => {
    try {
        const { code, language, input } = req.body;

        if (!code || !language) {
            // clear
            return res
                .status(400)
                .json({ error: "Code and language required" });
        }

        const jobId = uuid();
        const jobDir = `/tmp/${jobId}`;

        fs.mkdirSync(jobDir, { recursive: true });

        let fileName = "";
        let runCmd = "";

        switch (language) {
            case "cpp":
                fileName = "main.cpp";
                runCmd = `g++ main.cpp -o main && timeout ${TIMEOUT}s ./main`;
                break;
            case "python":
                fileName = "main.py";
                runCmd = `timeout ${TIMEOUT}s python3 main.py`;
                break;
            case "java":
                fileName = "Main.java";
                runCmd = `javac Main.java && timeout ${TIMEOUT}s java Main`;
                break;
            case "javascript":
                fileName = "main.js";
                runCmd = `timeout ${TIMEOUT}s node main.js`;
                break;
            default:
                return res.status(400).json({ error: "Unsupported language" });
        }

        fs.writeFileSync(`${jobDir}/${fileName}`, code);
        fs.writeFileSync(`${jobDir}/input.txt`, input || "");

        const command = `cd ${jobDir} && bash /app/runner.sh "${runCmd}"`;

        const start = Date.now();

        exec(command, (error, stdout, stderr) => {
            const end = Date.now();

            let status = "success";

            if (error) {
                if (error.killed) status = "timeout";
                else status = "runtime_error";
            }

            if (stderr && stderr.includes("error:"))
                status = "compilation_error";

            res.json({
                stdout,
                stderr,
                status,
                time: end - start + "ms",
            });

            fs.rmSync(jobDir, { recursive: true, force: true });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Execution failed" });
    }
});

app.listen(5000, () => console.log("Execution service running"));
