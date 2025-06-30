FROM node:20-alpine

WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for tsx and TypeScript)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PROD=true

# Install netcat for database connection check
RUN apk add --no-cache netcat-openbsd

# Create startup script that waits for DB, runs migrations, then starts app
RUN printf '#!/bin/sh\n\
echo "Waiting for database..."\n\
while ! nc -z postgres 5432; do\n\
  sleep 1\n\
done\n\
echo "Database is ready!"\n\
echo "Running migrations..."\n\
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/postgres?sslmode=disable npm run db:up\n\
echo "Starting application..."\n\
npm run backend-primary:railway\n' > /app/start.sh && chmod +x /app/start.sh

# Expose port
EXPOSE 5002

# Start with migrations then the backend application
CMD ["/app/start.sh"] 