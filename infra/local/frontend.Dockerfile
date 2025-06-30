
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run frontend:build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY infra/local/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 