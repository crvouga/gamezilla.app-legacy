FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

ARG SERVER_REGISTRY_SRC_URL
ENV SERVER_REGISTRY_SRC_URL=${SERVER_REGISTRY_SRC_URL}

RUN pnpm frontend-web:build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY infra/frontend-web/frontend-web.nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 