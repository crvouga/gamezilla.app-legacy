FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY ./ ./

RUN npm ci --production=false

ARG DATABASE_URL

ENV DATABASE_URL=${DATABASE_URL}

RUN npm run db:up

ARG PORT

ENV PORT=${PORT}

CMD ["npm", "run", "backend-primary:railway"]