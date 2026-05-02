# Production Deployment

This project needs three deployed pieces:

1. Frontend: React/Vite app.
2. Backend API: authentication, problems, submissions, AI analysis.
3. Execution service: isolated code runner for Python, JavaScript, C++, Java.

For a real deployment, do not use `localhost`, Ollama on your laptop, or local MongoDB.

## Recommended Hosting

- Frontend: Vercel or Netlify.
- Backend API: Render, Railway, Fly.io, or any Docker-capable host.
- Execution service: Docker-capable host only, because it needs compilers/runtime tools.
- Database: MongoDB Atlas.

## Frontend Env

Set this in the frontend hosting dashboard before building:

```env
VITE_API_URL=https://your-backend-domain.onrender.com/api
```

For your own domain, use your API subdomain:

```env
VITE_API_URL=https://api.yourdomain.com/api
```

Build command:

```bash
npm install
npm run build
```

Publish directory:

```text
dist
```

## Backend Env

Use `Backend/.env.example` as the template.

Important production values:

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=long_random_secret
CLIENT_URL=https://your-frontend-domain.vercel.app
EXECUTION_SERVICE_URL=https://your-execution-service-domain.onrender.com/execute
AI_PROVIDER=gemini
GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_MODEL=gemini-1.5-flash
```

For your own domain:

```env
CLIENT_URL=https://yourdomain.com,https://www.yourdomain.com
EXECUTION_SERVICE_URL=https://runner.yourdomain.com/execute
```

## AI In Production

The app is clean whether AI is enabled or disabled:

- `AI_PROVIDER=disabled`: AI button is disabled and the UI shows a neat "Off" state.
- `AI_PROVIDER=gemini`: hosted free-tier AI from Google AI Studio.
- `AI_PROVIDER=openai`: AI button is enabled if `OPENAI_API_KEY` is present.
- `AI_PROVIDER=ollama`: local/dev only unless you deploy your own Ollama server.

Recommended free hosted setup:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_MODEL=gemini-1.5-flash
```

Gemini free tier has rate limits. It is not unlimited, but it does not require your laptop or your own AI server.

Alternative hosted setup:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-4o-mini
```

Ollama is only free because it runs on your own computer. It is not suitable for normal cloud deployment unless you also deploy and maintain an Ollama server.

If you later deploy your own Ollama GPU server:

```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=https://ai.yourdomain.com
OLLAMA_MODEL=qwen2.5-coder:1.5b
```

Backend start command:

```bash
npm install
npm start
```

Health check:

```text
/health
```

AI status check:

```text
/api/code/analyze/status
```

## Execution Service

Deploy `container/` as a Docker service. It already has a Dockerfile with Python, Java, C++, and Node installed.

Build locally:

```bash
cd container
docker build -t oj-execution-service .
```

Run locally:

```bash
docker run --rm -p 5001:5001 --cpus=1 --memory=1g --pids-limit=128 oj-execution-service
```

Production env:

```env
PORT=5001
NODE_ENV=production
APP_DIR=/app
TEMP_DIR=/tmp/oj-jobs
RUNNER_SCRIPT_PATH=/app/runner.sh
```

Then set backend:

```env
EXECUTION_SERVICE_URL=https://your-execution-service-domain/execute
```

## Security Notes

- Rotate any API keys that were committed or shared.
- Do not commit real `.env` files.
- Use separate services for backend and code execution.
- Keep execution service CPU, memory, and process limits enabled on the host.
- Do not expose MongoDB credentials in frontend code.

## Local Development

Backend:

```bash
cd Backend
npm run dev
```

Frontend:

```bash
cd Frontend
npm run dev
```

Execution service:

```bash
cd container
npm start
```

For local free AI:

```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5-coder:1.5b
```

Install Ollama and run:

```bash
ollama pull qwen2.5-coder:1.5b
```
