FROM node:22-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY src/ ./src/
COPY tsconfig.json ./

RUN pnpm install --frozen-lockfile

RUN pnpm exec tsc

ARG NODE_ENV=production
ARG TOPIC_PORT=8080

ENV NODE_ENV=${NODE_ENV}
ENV TOPIC_PORT=${TOPIC_PORT}

EXPOSE ${TOPIC_PORT}

CMD ["node", "dist/topic.js"]