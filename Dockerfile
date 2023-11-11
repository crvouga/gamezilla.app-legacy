FROM jarredsumner/bun:edge

WORKDIR /usr/src/app
COPY . /usr/src/app

RUN bun install

EXPOSE 5000

CMD bun run gamezilla/gamezilla.server.ts
