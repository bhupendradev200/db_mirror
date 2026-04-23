import { Router } from "express";

export function adminRoutes(adminCtrl) {
  const r = Router();
  r.post("/admin/induce-lag/:replica", adminCtrl.induceLag);
  return r;
}

