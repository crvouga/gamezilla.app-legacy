FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY ./ ./

RUN pnpm install --prod --frozen-lockfile

CMD ["pnpm", "run", "backend-edge:railway"]