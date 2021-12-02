import Fastify from "fastify";

const fastify = Fastify({
  logger: true,
});

fastify.setNotFoundHandler((_request, reply) => {
  reply.send({
    message: "Hello from server",
  });
});

const PORT = process.env.PORT ?? 5000;

fastify.listen(PORT);
