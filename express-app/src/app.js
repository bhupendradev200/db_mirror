import express from "express";

import { healthController } from "./controllers/healthController.js";
import { itemsController } from "./controllers/itemsController.js";
import { replicationController } from "./controllers/replicationController.js";
import { adminController } from "./controllers/adminController.js";

import { itemsRoutes } from "./routes/itemsRoutes.js";
import { readBalancerRoutes } from "./routes/readBalancerRoutes.js";
import { replicationRoutes } from "./routes/replicationRoutes.js";
import { adminRoutes } from "./routes/adminRoutes.js";

export function createApp({ itemsService, replicationService, itemsRepo, replicas, logger }) {
  const app = express();
  app.use(express.json());

  app.get("/health", healthController());

  const itemsCtrl = itemsController(itemsService);
  const replCtrl = replicationController(replicationService, logger);
  const admCtrl = adminController(replicationService);

  app.use(itemsRoutes(itemsCtrl));
  app.use(readBalancerRoutes(replicas, itemsRepo, logger));
  app.use(replicationRoutes(replCtrl));
  app.use(adminRoutes(admCtrl));

  // Minimal error boundary to keep responses clean
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    const status = err.statusCode || 500;
    if (status >= 500) logger.error("unhandled error", err);
    res.status(status).json({ error: err.message || "internal error" });
  });

  return app;
}

