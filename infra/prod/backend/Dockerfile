FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lockb ./
COPY ./ ./

RUN bun install

ARG DATABASE_URL

ENV DATABASE_URL=${DATABASE_URL}

RUN bun backend:build

CMD ["bun", "backend"]