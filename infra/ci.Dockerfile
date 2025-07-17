FROM mcr.microsoft.com/playwright:v1.41.1-jammy

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY ./ ./

CMD ["pnpm", "help"]