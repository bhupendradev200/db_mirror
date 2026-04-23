function required(name, value) {
  if (!value) throw new Error(`Missing env var ${name}`);
  return value;
}

function intEnv(name, fallback) {
  const v = process.env[name];
  if (!v) return fallback;
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`Env var ${name} must be a number`);
  return n;
}

export function loadConfig() {
  const dbName = required("DB_NAME", process.env.DB_NAME);

  return {
    port: intEnv("PORT", 3000),
    logReplicationPollMs: intEnv("LOG_REPLICATION_POLL_MS", 0),
    dbName,
    master: {
      host: required("MASTER_HOST", process.env.MASTER_HOST),
      port: intEnv("MASTER_PORT", 3306),
      user: required("MASTER_USER", process.env.MASTER_USER),
      password: required("MASTER_PASSWORD", process.env.MASTER_PASSWORD),
      database: dbName
    },
    replicas: [
      {
        name: "replica1",
        host: required("REPLICA1_HOST", process.env.REPLICA1_HOST),
        port: intEnv("REPLICA1_PORT", 3306)
      },
      {
        name: "replica2",
        host: required("REPLICA2_HOST", process.env.REPLICA2_HOST),
        port: intEnv("REPLICA2_PORT", 3306)
      },
      {
        name: "replica3",
        host: required("REPLICA3_HOST", process.env.REPLICA3_HOST),
        port: intEnv("REPLICA3_PORT", 3306)
      }
    ],
    replicaAuth: {
      user: required("REPLICA_USER", process.env.REPLICA_USER),
      password: required("REPLICA_PASSWORD", process.env.REPLICA_PASSWORD),
      database: dbName
    },
    monitorAuth: {
      user: required("MONITOR_USER", process.env.MONITOR_USER),
      password: required("MONITOR_PASSWORD", process.env.MONITOR_PASSWORD)
    },
    lagAdminAuth: {
      user: required("LAGADMIN_USER", process.env.LAGADMIN_USER),
      password: required("LAGADMIN_PASSWORD", process.env.LAGADMIN_PASSWORD)
    }
  };
}

