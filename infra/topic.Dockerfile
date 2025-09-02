FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy source code
COPY src/ ./src/
COPY tsconfig.json ./

# Install dependencies
RUN pnpm install --prod --frozen-lockfile

# Build arguments
ARG NODE_ENV=production
ARG TOPIC_PORT=8080

# Environment variables
ENV NODE_ENV=${NODE_ENV}
ENV TOPIC_PORT=${TOPIC_PORT}

# Expose port
EXPOSE ${TOPIC_PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${TOPIC_PORT}/health || exit 1

# Start the application
CMD ["node", "-r", "tsx/cjs", "src/topic.ts"]