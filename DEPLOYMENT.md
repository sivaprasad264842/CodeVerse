# Production Deployment

The project has three production pieces:

1. Frontend: React/Vite app.
2. Backend API: authentication, problems, submissions, and OpenAI analysis.
3. Runner: isolated execution service for Python, JavaScript, C++, and Java.

## Frontend

Set this before building:

```env
VITE_API_URL=https://www.topcoders.com/api
```

Build:

```bash
cd Frontend
npm ci
npm run build
```

## Backend

Use `Backend/.env.example` as a template. In production, set these values in your host, ECS task definition, or SSM Parameter Store:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=long_random_secret
CLIENT_URL=https://topcoders.com,https://www.topcoders.com
EXECUTION_SERVICE_URL=http://runner:5001/execute
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

Health check:

```text
/health
```

AI status check:

```text
/api/code/analyze/status
```

## Runner

The runner must run as a Docker container because it needs compiler/runtime tools.

Production env:

```env
NODE_ENV=production
PORT=5001
TEMP_DIR=/tmp/oj-jobs
```

Keep the runner private. Only the backend should reach `/execute`.

## AWS

For ECR and ECS on EC2, follow `DEPLOYMENT_AWS_ECS_EC2.md`.

## Security Notes

- Rotate any API keys or passwords that were committed, shared, or pasted into chat.
- Do not commit real `.env` files.
- Do not bake secrets into Docker images.
- Use ECS task secrets or SSM Parameter Store for production secrets.
- Keep CPU, memory, and process limits on the runner.
- Do not expose MongoDB credentials or API keys to frontend code.
