import client from "prom-client";

export function createMetrics() {
  client.collectDefaultMetrics();

  const httpRequestsTotal = new client.Counter({
    name: "http_requests_total",
    help: "Total HTTP requests",
    labelNames: ["method", "route", "status_code"]
  });

  const httpRequestDurationSeconds = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    labelNames: ["method", "route", "status_code"],
    // reasonable defaults for APIs
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
  });

  function metricsMiddleware(req, res, next) {
    const start = process.hrtime.bigint();

    res.on("finish", () => {
      const route = req.route?.path ?? req.path ?? "unknown";
      const status = String(res.statusCode);
      const method = req.method;

      const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;

      httpRequestsTotal.labels(method, route, status).inc(1);
      httpRequestDurationSeconds.labels(method, route, status).observe(durationSeconds);
    });

    next();
  }

  async function metricsHandler(_req, res) {
    res.set("Content-Type", client.register.contentType);
    res.send(await client.register.metrics());
  }

  return { metricsMiddleware, metricsHandler };
}

