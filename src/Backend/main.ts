import http from "http";

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });

  res.end("hellos World!\n");
});

const env = {
  port: Number(process.env.PORT ?? 3000),
};

server.listen(env.port);

console.log(`Backend Ready\n -\- Local: http://localhost:${env.port}/`);
