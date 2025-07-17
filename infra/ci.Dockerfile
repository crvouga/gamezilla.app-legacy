FROM crvouga/gamezilla-app-ci-base:latest   

WORKDIR /app

COPY ./ ./

RUN pnpm install --frozen-lockfile

CMD ["pnpm", "help"]