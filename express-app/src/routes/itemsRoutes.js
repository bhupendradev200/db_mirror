import { Router } from "express";

export function itemsRoutes(itemsCtrl) {
  const r = Router();

  r.post("/write", itemsCtrl.write);
  r.get("/read/replica1", itemsCtrl.readReplica("replica1"));
  r.get("/read/replica2", itemsCtrl.readReplica("replica2"));
  r.get("/read/replica3", itemsCtrl.readReplica("replica3"));

  return r;
}

