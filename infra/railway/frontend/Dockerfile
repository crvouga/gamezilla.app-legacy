# Build stage
FROM oven/bun:latest AS build

WORKDIR /app

# Copy package.json and lockfile first
COPY package.json bun.lock ./

# Install dependencies with verbose logging
RUN bun install --verbose

# Copy the rest of the app files
COPY . .

# Build with more verbose output
RUN NODE_ENV=production bunx --bun vite build --debug

# Serve stage
FROM nginx:alpine

# Copy built frontend files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY ./infra/railway/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]