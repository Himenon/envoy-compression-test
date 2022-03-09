import * as PrometheusClient from "prom-client";

export const register = new PrometheusClient.Registry();

register.setDefaultLabels({
  app: "nodejs-http-server",
});

PrometheusClient.collectDefaultMetrics({ register, eventLoopMonitoringPrecision: 1 });

export const AccessCounter = new PrometheusClient.Counter({
  name: "access_conter",
  help: "Access counter per path",
  registers: [register],
  labelNames: ["method", "path"] as const,
});
