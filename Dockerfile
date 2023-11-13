# syntax = docker/dockerfile:1

# Adjust BUN_VERSION as desired
ARG BUN_VERSION=1.0.3
FROM oven/bun:${BUN_VERSION} as base
FROM amacneil/dbmate as dbmate


LABEL fly_launch_runtime="Bun"

# Bun app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y build-essential pkg-config python-is-python3 libsqlite3-dev

# Install node modules
COPY bun.lockb package.json ./
RUN bun install --ci

# Copy application code
COPY . .
COPY db/migrations /app/db/migrations

# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Copy dbmate binary from the dbmate image
COPY --from=dbmate /usr/local/bin/dbmate /usr/local/bin/dbmate


# Define the volume where SQLite data will be stored
VOLUME /data

# Update environment variables to use the volume for SQLite data
ENV SQLITE_DATABASE_FILE="/data/my-database.db"

# Expose the port the server runs on
EXPOSE 5000

# Start the server by default, this can be overwritten at runtime
CMD [ "bun", "run", "server:prod" ]
