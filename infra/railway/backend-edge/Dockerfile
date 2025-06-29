FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY ./ ./

RUN npm ci --production=false

ARG PORT

ENV PORT=${PORT}

CMD ["npm", "run", "backend-edge:railway"]