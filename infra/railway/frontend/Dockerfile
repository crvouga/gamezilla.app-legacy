# Build stage
FROM oven/bun:latest AS build

WORKDIR /app

# Copy package.json and lockfile first to leverage Docker caching
COPY package.json bun.lock ./

# Install dependencies without cache
RUN bun install --no-cache

# Copy the rest of the app files
COPY . .

# Set environment variables for Railway
ARG VITE_BACKEND_URL
ARG VITE_POWERSYNC_URL

# Debugging: Print environment variables (Remove after verifying)
RUN echo "VITE_BACKEND_URL=$VITE_BACKEND_URL" && echo "VITE_POWERSYNC_URL=$VITE_POWERSYNC_URL"

# Set environment variables
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
ENV VITE_POWERSYNC_URL=${VITE_POWERSYNC_URL}

# Ensure permissions (useful for CI/CD environments)
RUN chmod -R 777 /app

# Run the build process
RUN bun run frontend:build

# Serve stage
FROM nginx:latest AS serve

# Copy built frontend files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY ./infra/railway/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for serving
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
