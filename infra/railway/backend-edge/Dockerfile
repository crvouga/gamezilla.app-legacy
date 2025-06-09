FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock ./
COPY ./ ./

RUN bun install

ARG PORT

ENV PORT=${PORT}


CMD ["bun", "backend-edge"]