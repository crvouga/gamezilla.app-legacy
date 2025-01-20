FROM oven/bun:1.1.38

# Set working directory
WORKDIR /app

# Install essential dependencies
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
    # Additional dependencies that might help with WASM
    libssl-dev \
    pkg-config \
    python3 \
    gcc \
    g++ \
    cmake \
    && apt-get clean

# Set environment variables for WebAssembly
ENV NODE_OPTIONS="--experimental-wasm-threads --experimental-wasm-bulk-memory"
ENV PGLITE_DISABLE_WASM_MEMORY_CONTROL=1
ENV PGLITE_WASM_MEMORY_MB=1024
ENV BUN_WASM_EXECUTION=sync
ENV BUN_WASM_VERBOSE=1
ENV BUN_WASM_MEMORY_SIZE=65536
ENV BUN_WASM_DEBUG=2


COPY . .