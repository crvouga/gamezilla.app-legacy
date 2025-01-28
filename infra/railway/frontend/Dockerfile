FROM oven/bun:latest AS build

WORKDIR /app

COPY package.json bun.lock ./
COPY ./ ./

RUN bun install

ARG VITE_BACKEND_URL

ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

ARG VITE_POWERSYNC_URL

ENV VITE_POWERSYNC_URL=${VITE_POWERSYNC_URL}

RUN bun run frontend:build

FROM nginx:latest AS serve

COPY --from=build /app/dist /usr/share/nginx/html

COPY ./infra/railway/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]