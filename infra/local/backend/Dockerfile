FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Install essential dependencies and PostgreSQL client
RUN apt-get update && \
    apt-get install -y \
    libnss3 \
    libstdc++6 \
    libgcc1 \
    libc6 \
    libsqlite3-0 \
    libc6-dev \
    libcurl4 \
    libatomic1 \
    build-essential \
    postgresql-client \
    && apt-get clean

COPY . .