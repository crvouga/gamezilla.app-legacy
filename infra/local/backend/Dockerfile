FROM oven/bun:latest

WORKDIR /app

# Install PostgreSQL client
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    wget \
    gnupg \
    lsb-release \
    postgresql-client && \
    rm -rf /var/lib/apt/lists/*

COPY ./ ./
