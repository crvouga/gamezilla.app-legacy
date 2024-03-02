# syntax = docker/dockerfile:1

# Base Stage: Install Bun
ARG BUN_VERSION=1.0.3
FROM oven/bun:${BUN_VERSION} as base

# Set the working directory for the base image
WORKDIR /app

# Set production environment variable
ENV NODE_ENV="production"

# Dbmate Stage: Get dbmate binary
# You should specify a specific version tag for dbmate
FROM amacneil/dbmate:latest as dbmate

# Build Stage: Compile and build the application
FROM base as build

# Install necessary packages for building, including git
RUN apt-get update -qq && \
    apt-get install -y build-essential pkg-config python-is-python3 libsqlite3-dev


# Copy package files and install dependencies
COPY bun.lockb package.json ./
RUN bun install --ci

# Copy application code to the /app directory
COPY . /app

# Final Stage: Create the final image
FROM base

# Copy the built application from the build stage
COPY --from=build /app /app

# Copy dbmate binary from the dbmate image
COPY --from=dbmate /usr/local/bin/dbmate /usr/local/bin/dbmate

# Define the volume for SQLite data
# defined in deployment platform
# VOLUME /data

# Expose the application port
EXPOSE 5000


# Modify the CMD instruction to run the script before starting the server
CMD  bun run server-prod
