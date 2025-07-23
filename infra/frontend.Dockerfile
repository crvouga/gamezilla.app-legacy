FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

ARG BACKEND_URL
ENV BACKEND_URL=${BACKEND_URL}

ARG TOPIC_URL
ENV TOPIC_URL=${TOPIC_URL}

ARG FRONTEND_PORT
ENV FRONTEND_PORT=${FRONTEND_PORT}

RUN pnpm frontend:build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY infra/frontend.nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 