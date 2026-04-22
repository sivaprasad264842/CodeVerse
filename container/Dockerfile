FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    python3 \
    nodejs \
    npm \
    openjdk-17-jdk \
    g++ \
    coreutils \
    util-linux \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

RUN chmod +x runner.sh

EXPOSE 5000

CMD ["node", "server.js"]