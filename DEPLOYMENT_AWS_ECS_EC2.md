# AWS Deployment (ECR + ECS on Free-Tier EC2)

This path deploys your **Backend API** and the **Execution service** on AWS using:

- **ECR**: container registry
- **ECS (EC2 launch type)**: runs containers on your EC2 instance
- **EC2 free tier**: `t2.micro`/`t3.micro` (region-dependent)

You do **not** need Docker Desktop on the server. ECS/EC2 runs Docker for you.

> Note: ECS itself is free, but you pay for the underlying compute (EC2). Free tier can cover a small instance for a limited period.

## Prerequisites

- AWS account
- AWS CLI installed locally and configured (`aws configure`)
- A domain name (optional but recommended)
- MongoDB Atlas (recommended) or another hosted MongoDB

## 1) Prepare environment variables

Backend env (store in **ECS task definition** / **SSM Parameter Store**, not in git):

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=long_random_secret
CLIENT_URL=https://your-frontend-domain
EXECUTION_SERVICE_URL=http://runner:5001/execute

AI_PROVIDER=gemini
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-1.5-flash

# or:
# AI_PROVIDER=openai
# OPENAI_API_KEY=...
# OPENAI_MODEL=gpt-4o-mini
```

Runner env:

```env
NODE_ENV=production
PORT=5001
```

## 2) Create ECR repositories

Create two repos (once):

```bash
aws ecr create-repository --repository-name oj-backend
aws ecr create-repository --repository-name oj-runner
```

## 3) Build and push images to ECR (from your local machine)

Login to ECR:

```bash
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account_id>.dkr.ecr.<region>.amazonaws.com
```

Build + push Backend:

```bash
docker build -t oj-backend ./Backend
docker tag oj-backend:latest <account_id>.dkr.ecr.<region>.amazonaws.com/oj-backend:latest
docker push <account_id>.dkr.ecr.<region>.amazonaws.com/oj-backend:latest
```

Build + push Runner:

```bash
docker build -t oj-runner ./container
docker tag oj-runner:latest <account_id>.dkr.ecr.<region>.amazonaws.com/oj-runner:latest
docker push <account_id>.dkr.ecr.<region>.amazonaws.com/oj-runner:latest
```

## 4) Create ECS cluster (EC2)

In AWS Console:

- ECS → Clusters → Create Cluster
- Choose **EC2**
- Add capacity with an **Auto Scaling Group**
  - Instance type: `t3.micro` (or free-tier eligible)
  - Desired capacity: 1
  - Enable **ECS optimized AMI**

## 5) Create task definitions (2 containers in one task)

Create one ECS task definition that runs **two containers**:

- `runner` container
  - Image: `.../oj-runner:latest`
  - Port mapping: `5001`
- `backend` container
  - Image: `.../oj-backend:latest`
  - Port mapping: `5000`
  - Env vars: set from the section above
  - Set `EXECUTION_SERVICE_URL` to `http://runner:5001/execute`

Because both containers run in the same ECS task, `backend` can call `runner` by the **container name** (`runner`).

## 6) Create ECS service + Load Balancer

Create a service from the task definition:

- Desired tasks: 1
- Networking: your VPC subnets
- Attach an **Application Load Balancer**
  - Listener: 80/443
  - Target group: backend container port `5000`

Security group rules:

- ALB: allow inbound 80/443 from the internet
- EC2 instances: allow inbound from ALB security group to port `5000`

## 7) Health checks

Backend health endpoint (already documented):

- Path: `/health`
- ALB target group health check path: `/health`

## 8) Frontend config

Set:

```env
VITE_API_URL=https://<your-alb-or-domain>/api
```

## 9) Common production gotchas

- If `/api/code/analyze/status` shows disabled:
  - Ensure `AI_PROVIDER` is `gemini` or `openai`
  - Ensure the correct API key env var exists in the ECS task (`GEMINI_API_KEY` or `OPENAI_API_KEY`)
- If the runner is slow or fails compiles:
  - `t3.micro` is tiny; increase instance size for real load
- Keep the runner private (only backend should reach it). In this setup it is not exposed publicly.

