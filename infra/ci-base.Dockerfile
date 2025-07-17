FROM mcr.microsoft.com/playwright:v1.41.1-jammy

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

CMD ["pnpm", "help"]