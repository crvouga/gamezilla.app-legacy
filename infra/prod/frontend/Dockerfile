FROM oven/bun:latest AS build

WORKDIR /app

COPY package.json bun.lockb ./
COPY ./ ./

RUN bun install

ARG BACKEND_URL

ENV BACKEND_URL=${BACKEND_URL}

RUN bun frontend:build

FROM nginx:latest AS serve

COPY --from=build /app/dist /usr/share/nginx/html

COPY ./infra/prod/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]