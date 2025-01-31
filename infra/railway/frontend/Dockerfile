# Build stage
FROM oven/bun:latest AS build

WORKDIR /app

# Copy package.json and lockfile first
COPY package.json bun.lock ./

# Install dependencies with verbose logging
RUN bun install --verbose

# Copy the rest of the app files
COPY . .

# Set environment variables for Railway
ARG VITE_BACKEND_URL
ARG VITE_POWERSYNC_URL
ARG VITE_ELECTRIC_URL

# Set environment variables
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
ENV VITE_POWERSYNC_URL=${VITE_POWERSYNC_URL}
ENV VITE_ELECTRIC_URL=${VITE_ELECTRIC_URL}

# Add debugging for environment variables
RUN echo "Environment variables:" && \
    echo "VITE_BACKEND_URL=$VITE_BACKEND_URL" && \
    echo "VITE_POWERSYNC_URL=$VITE_POWERSYNC_URL" && \
    echo "VITE_ELECTRIC_URL=$VITE_ELECTRIC_URL"

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