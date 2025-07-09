FROM node:22-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY ./ ./

RUN pnpm install --prod --frozen-lockfile

ARG NODE_ENV

ENV NODE_ENV=${NODE_ENV}

CMD ["pnpm", "run", "backend-primary"]