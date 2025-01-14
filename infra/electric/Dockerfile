FROM electricsql/electric:latest

ARG DATABASE_URL

ENV DATABASE_URL=${DATABASE_URL}

ARG PORT

# https://electric-sql.com/docs/api/config#electric-port
ENV ELECTRIC_PORT=${PORT}

EXPOSE ${PORT}