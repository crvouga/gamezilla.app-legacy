FROM node:22-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY src/ ./src/
COPY tsconfig.json ./

RUN pnpm install --prod --frozen-lockfile

ARG NODE_ENV
ARG TOPIC_PORT

ENV NODE_ENV=${NODE_ENV}
ENV TOPIC_PORT=${TOPIC_PORT:-8080}

EXPOSE ${TOPIC_PORT:-8080}

CMD ["pnpm", "run", "topic"]