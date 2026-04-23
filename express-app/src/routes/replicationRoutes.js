import { Router } from "express";

export function replicationRoutes(replicationCtrl) {
  const r = Router();
  r.get("/replication-status", replicationCtrl.status);
  return r;
}

