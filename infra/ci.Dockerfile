FROM node:22-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Add build argument to force cache invalidation
ARG BUILD_DATE
ENV BUILD_DATE=${BUILD_DATE}

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY ./ ./

RUN pnpm install --frozen-lockfile

ARG NODE_ENV

ENV NODE_ENV=${NODE_ENV}

CMD ["pnpm", "help"]