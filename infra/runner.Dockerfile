FROM crvouga/runner-base:latest

WORKDIR /app

COPY ./ ./

CMD ["pnpm", "help"]