FROM node:16

WORKDIR /app

# Install DEB dependencies and others.
RUN \
    set -x \
    && apt-get update \
    && apt-get install -y net-tools build-essential python3 python3-pip valgrind

ADD package*.json /app

RUN npm install

COPY . /app

RUN npm run backend:build

CMD [ "npm", "run", "backend:start" ]