import path from "path";
import Fastify from "fastify";
import fastifyStatic from "fastify-static";

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifyStatic, {
  root: path.join(__dirname, "..", "client", "public"),
});

fastify.setNotFoundHandler((_request, reply) => {
  reply.sendFile("index.html");
});

fastify.listen(process.env.PORT ?? 5000);
