FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY ./ ./

RUN npm ci --omit=dev --legacy-peer-deps

CMD ["npm", "run", "backend-primary:railway"]