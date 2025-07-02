FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 5002

CMD ["pnpm", "run", "backend-primary"]