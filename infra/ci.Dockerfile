FROM crvouga/gamezilla-app-ci-base:latest

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY ./ ./

CMD ["pnpm", "help"]