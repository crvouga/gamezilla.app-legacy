FROM crvouga/runner-base:latest

WORKDIR /app

COPY ./ ./

RUN cp .env.local .env

CMD ["pnpm", "help"]