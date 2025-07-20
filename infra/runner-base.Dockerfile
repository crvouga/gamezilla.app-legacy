FROM mcr.microsoft.com/playwright:latest

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

RUN pnpm e2e:ci:setup

CMD ["pnpm", "help"]