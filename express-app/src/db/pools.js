import { makePool } from "./poolFactory.js";

export function createPools(config) {
  const master = makePool(config.master);

  const replicas = config.replicas.map((r) => ({
    name: r.name,
    host: r.host,
    port: r.port,
    pool: makePool({
      host: r.host,
      port: r.port,
      user: config.replicaAuth.user,
      password: config.replicaAuth.password,
      database: config.replicaAuth.database
    })
  }));

  const replicaMonitors = config.replicas.map((r) => ({
    name: r.name,
    monitorPool: makePool({
      host: r.host,
      port: r.port,
      user: config.monitorAuth.user,
      password: config.monitorAuth.password
    })
  }));

  const replicaAdmins = config.replicas.map((r) => ({
    name: r.name,
    adminPool: makePool({
      host: r.host,
      port: r.port,
      user: config.lagAdminAuth.user,
      password: config.lagAdminAuth.password
    })
  }));

  return { master, replicas, replicaMonitors, replicaAdmins };
}

