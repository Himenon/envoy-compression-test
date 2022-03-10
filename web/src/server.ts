import fastify from "fastify";
import * as Metrics from "./metrics";
import * as Fake from "./fake";

const applicationName = "nodejs-http-server";

process.title = applicationName;


const data = Fake.generateRandomObject(10);

const createServer = () => {
  const server = fastify({ logger: true });
  server.get("/", async (request, reply) => {
    reply.type("application/json").send(data);
  });

  server.get("/nginx", async (request, reply) => {
    Metrics.AccessCounter.labels({
      method: "GET",
      path: "/nginx",
    }).inc();
    reply.send({ hello: "world" });
  });

  server.get("/envoy", async (request, reply) => {
    Metrics.AccessCounter.labels({
      method: "GET",
      path: "/envoy",
    }).inc();
    reply.send({ hello: "world" });
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
    await server.listen({
      host: "0.0.0.0",
      port: parseInt(`${process.env.PORT}`, 10) || 3000,
    });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
