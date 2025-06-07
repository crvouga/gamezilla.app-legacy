FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock ./
COPY ./ ./

RUN bun install

CMD ["bun", "backend"]