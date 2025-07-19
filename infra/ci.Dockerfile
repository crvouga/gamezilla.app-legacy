FROM crvouga/gamezilla-app-ci-base:latest

WORKDIR /app

COPY ./ ./

CMD ["pnpm", "help"]