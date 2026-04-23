import { Router } from "express";

export function metricsRoutes(metricsHandler) {
  const r = Router();
  r.get("/metrics", metricsHandler);
  return r;
}

