import axios from "axios";
import OpenAI from "openai";

const SYSTEM_INSTRUCTION =
    "You are a concise online judge code reviewer. Explain likely bugs, complexity, edge cases, and one next improvement. Do not provide a full replacement solution unless the user asks.";

const providerConfig = {
    gemini: {
        keyName: "GEMINI_API_KEY",
        defaultModel: "gemini-1.5-flash",
        modelName: "GEMINI_MODEL",
    },
    openai: {
        keyName: "OPENAI_API_KEY",
        defaultModel: "gpt-4o-mini",
        modelName: "OPENAI_MODEL",
    },
};

const getProvider = () =>
    String(process.env.AI_PROVIDER || "disabled").trim().toLowerCase();

const buildPrompt = ({ code, language, problemTitle, statement, verdict }) => `
Problem: ${problemTitle || "Unknown"}

Statement:
${statement || ""}

Language: ${language}
Verdict: ${verdict || "Not submitted yet"}

Code:
${code}

Review this online judge solution concisely. Explain likely bugs, complexity, edge cases, and one next improvement.
`;

const getStatusPayload = () => {
    const provider = getProvider();
    const config = providerConfig[provider];

    if (!config) {
        return {
            enabled: false,
            provider: "disabled",
            model: "",
            message: "AI analysis is disabled for this deployment.",
        };
    }

    const hasKey = Boolean(process.env[config.keyName]);
    return {
        enabled: hasKey,
        provider,
        model: process.env[config.modelName] || config.defaultModel,
        message: hasKey
            ? "AI analysis is available."
            : `AI analysis needs ${config.keyName}.`,
    };
};

const normalizeProviderError = (error, provider) => {
    const status = error.status || error.response?.status || 500;
    const providerName = provider === "gemini" ? "Gemini" : "OpenAI";
    const message =
        error.response?.data?.error?.message ||
        error.response?.data?.error ||
        error.error?.message ||
        error.message ||
        "";

    if (status === 401) {
        return {
            status,
            error: `${providerName} API key is invalid or expired. Create a new key, update Backend/.env, and restart the backend.`,
        };
    }

    if (status === 403) {
        return {
            status,
            error: `${providerName} does not allow this key to use the selected model. Check the model name and project access.`,
        };
    }

    if (status === 429) {
        return {
            status,
            error: `${providerName} rate limit or quota reached. Try again later or use another key/project.`,
        };
    }

    if (status === 400 && message) {
        return { status, error: message };
    }

    return {
        status: 500,
        error: "Failed to analyze code. Please try again later.",
    };
};

const runGeminiAnalysis = async (prompt) => {
    const model = process.env.GEMINI_MODEL || providerConfig.gemini.defaultModel;
    const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }],
                },
            ],
            systemInstruction: {
                parts: [{ text: SYSTEM_INSTRUCTION }],
            },
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 700,
            },
        },
        {
            params: { key: process.env.GEMINI_API_KEY },
            timeout: 60000,
        },
    );

    return (
        response.data?.candidates?.[0]?.content?.parts
            ?.map((part) => part.text || "")
            .join("")
            .trim() || "No analysis was returned by Gemini."
    );
};

const runOpenAIAnalysis = async (prompt) => {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
        model: process.env.OPENAI_MODEL || providerConfig.openai.defaultModel,
        input: [
            { role: "system", content: SYSTEM_INSTRUCTION },
            { role: "user", content: prompt },
        ],
    });

    return response.output_text || "No analysis was returned by OpenAI.";
};

export const getAnalysisStatus = (req, res) => {
    res.json(getStatusPayload());
};

export const analyzeCode = async (req, res) => {
    const { code, language, problemTitle, statement, verdict } = req.body || {};

    if (!code || !language) {
        return res.status(400).json({ error: "Code and language required" });
    }

    const status = getStatusPayload();
    if (!status.enabled) {
        return res.status(503).json({ error: status.message });
    }

    const prompt = buildPrompt({
        code,
        language,
        problemTitle,
        statement,
        verdict,
    });

    try {
        const analysis =
            status.provider === "gemini"
                ? await runGeminiAnalysis(prompt)
                : await runOpenAIAnalysis(prompt);

        return res.json({ analysis });
    } catch (error) {
        const safeError = normalizeProviderError(error, status.provider);
        console.error("AI analysis error:", {
            provider: status.provider,
            status: safeError.status,
            message: error.message,
        });
        return res.status(safeError.status).json({ error: safeError.error });
    }
};
