import path from "path";
import Fastify from "fastify";
import fastifyStatic from "fastify-static";

import { SHARED } from "../../shared/src";

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifyStatic, {
  root: path.join(__dirname, "..", "..", "client", "public"),
});

fastify.get("/api", (_request, reply) => {
  reply.send({
    message: `Hello using shared constants ${SHARED}`,
  });
});

fastify.setNotFoundHandler((_request, reply) => {
  reply.sendFile("index.html");
});

fastify.listen(process.env.PORT ?? 5000, "0.0.0.0");
