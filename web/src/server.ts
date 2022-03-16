import fastify from "fastify";
import * as Metrics from "./metrics";
import * as Fake from "./fake";
import compress from "fastify-compress";

const applicationName = "nodejs-http-server";

process.title = applicationName;

const data = Fake.generateRandomObject(10);

console.log(`Prepare Large Data Cached: ${Buffer.byteLength(JSON.stringify(data)) / 1000} KB.`);

const createServer = () => {
  const server = fastify({ logger: false });

  server.register(compress, { global: false });

  server.get("/envoy-proxy-gzip", { compress: false }, async (request, reply) => {
    reply.type("application/json").send(data);
  });

  server.get("/upstream-gzip", { compress: {} }, async (request, reply) => {
    reply.type("application/json").send(data);
  });

  server.get("/ping", async (request, reply) => {
    reply.send("pong\n");
  });

  server.get("/metrics", async (req, reply) => {
    reply.header("Content-Type", Metrics.register.contentType);
    return Metrics.register.metrics();
  });

  return server;
};

const start = async () => {
  const server = createServer();
  try {
    const address = await server.listen({
      host: "0.0.0.0",
      port: parseInt(`${process.env.PORT}`, 10) || 3000,
    });
    console.log(`Run Server: ${address}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
