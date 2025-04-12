FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock ./
COPY ./ ./

RUN bun install

# Remove the ARG and ENV lines since we'll get the DATABASE_URL from docker-compose
# ARG DATABASE_URL
# ENV DATABASE_URL=${DATABASE_URL}

# The build command will use the environment variables from docker-compose

# First run the build command to migrate the database, then start the backend
CMD bun run backend:build && bun run backend

