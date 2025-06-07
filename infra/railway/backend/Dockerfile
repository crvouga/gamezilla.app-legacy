FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock ./
COPY ./ ./

RUN bun install

ARG DATABASE_URL

ENV DATABASE_URL=${DATABASE_URL}

RUN bun db:up

CMD ["bun", "backend"]