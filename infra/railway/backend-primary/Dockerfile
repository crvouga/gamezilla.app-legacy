FROM oven/bun:latest

# Install Python and build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python-is-python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json bun.lock ./
COPY ./ ./

RUN bun install

ARG DATABASE_URL

ENV DATABASE_URL=${DATABASE_URL}

RUN bun db:up

ARG PORT

ENV PORT=${PORT}

CMD ["bun", "backend-primary:railway"]