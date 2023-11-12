FROM jarredsumner/bun:edge

WORKDIR /usr/src/app
COPY . /usr/src/app

RUN bun install

EXPOSE 5000

CMD NODE_ENV=production bun gamezilla/gamezilla.server.ts
