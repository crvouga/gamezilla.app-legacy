FROM node:16

WORKDIR /app

# mediasoup dependencies
RUN \
    set -x \
    && apt-get update \
    && apt-get install -y net-tools build-essential python3 python3-pip valgrind

ADD package*.json /app/

RUN [ "npm", "install", "--legacy-peer-deps" ]

COPY ./ /app/

RUN [ "npm", "run", "backend:build" ]

CMD [ "npm", "run", "backend:start" ]