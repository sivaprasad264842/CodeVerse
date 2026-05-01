FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y \
    python3 \
    openjdk-17-jdk \
    g++ \
    coreutils \
    util-linux \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN chmod +x /app/runner.sh

EXPOSE 5001

CMD ["node", "server.js"]
