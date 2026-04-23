import { Router } from "express";

export function readBalancerRoutes(replicas, itemsRepo, logger) {
  const r = Router();
  let rr = 0;

  r.get("/read/load-balanced", async (_req, res) => {
    const replica = replicas[rr % replicas.length];
    rr += 1;
    const rows = await itemsRepo.listRecentFromReplica(replica.name, 20);
    logger.info(`read load-balanced -> ${replica.name}: rows=${rows.length}`);
    res.json({ replica: replica.name, rows });
  });

  return r;
}

