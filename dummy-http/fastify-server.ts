import app from "fastify";
console.log("fastify - http - server");
const fastify = app({
  logger: false,
  disableRequestLogging: true,
  keepAliveTimeout: 1,
  connectionTimeout: 2,
  forceCloseConnections: true,
});
fastify.get("/", async (request, reply) => {
  const result = `<h1>hello, world 2</h1>`;
  return reply.type("text/html").code(200).send(result);
});
fastify.get("/api", async (request, reply) => {
  const result = { data: 123 };
  return reply.type("application/json").code(200).send(result);
});

// Run the server!
fastify.listen({ host: "0.0.0.0", port: 3000 });
