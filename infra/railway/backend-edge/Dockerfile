FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY ./ ./

RUN npm ci --omit=dev --legacy-peer-deps

ARG PORT

ENV PORT=${PORT}

CMD ["npm", "run", "backend-edge:railway"]