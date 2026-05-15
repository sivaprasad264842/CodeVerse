# AWS Deployment: ECR + ECS on EC2

This deploys two containers:

- `oj-backend`: Express API on port `5000`
- `oj-runner`: private code execution service on port `5001`

Use ECS task environment variables or SSM Parameter Store for secrets. Do not copy `.env` files into images or git.

## Production Environment

Backend container:

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

Runner container:

```env
NODE_ENV=production
PORT=5001
TEMP_DIR=/tmp/oj-jobs
```

Frontend build:

```env
VITE_API_URL=https://www.topcoders.com/api
```

## Build and Push to ECR

Set these once in your shell:

```bash
export AWS_REGION=ap-south-1
export AWS_ACCOUNT_ID=<account_id>
export ECR_REGISTRY=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
```

Create repositories:

```bash
aws ecr create-repository --repository-name oj-backend --region $AWS_REGION
aws ecr create-repository --repository-name oj-runner --region $AWS_REGION
```

Login:

```bash
aws ecr get-login-password --region $AWS_REGION \
  | docker login --username AWS --password-stdin $ECR_REGISTRY
```

Build and push:

```bash
docker build -t oj-backend ./Backend
docker tag oj-backend:latest $ECR_REGISTRY/oj-backend:latest
docker push $ECR_REGISTRY/oj-backend:latest

docker build -t oj-runner ./container
docker tag oj-runner:latest $ECR_REGISTRY/oj-runner:latest
docker push $ECR_REGISTRY/oj-runner:latest
```

## ECS on EC2

1. Create an ECS cluster with EC2 capacity using an ECS-optimized AMI.
2. Create one task definition with both containers.
3. Name the runner container `runner` so the backend can call `http://runner:5001/execute`.
4. Map backend port `5000`; keep runner port `5001` internal/private.
5. Attach an Application Load Balancer to backend port `5000`.
6. Set ALB health check path to `/health`.

Security groups:

- ALB allows inbound `80` and `443` from the internet.
- EC2/ECS instances allow backend port `5000` only from the ALB security group.
- Runner is not public.

## Domain

Point `www.topcoders.com` to the ALB using Route 53 or your DNS provider. Add an ACM certificate for `www.topcoders.com`, attach it to the ALB HTTPS listener, and redirect HTTP to HTTPS.

If the frontend is hosted separately, set `CLIENT_URL` to that frontend URL and point `VITE_API_URL` to the backend API domain.

## Checks

- Backend health: `https://www.topcoders.com/health`
- AI status: `https://www.topcoders.com/api/code/analyze/status`
- Expected AI status when configured: `enabled: true`, `provider: openai`
