import mysql from "mysql2/promise";

export function makePool({ host, port, user, password, database }) {
  const cfg = {
    host,
    port,
    user,
    password,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 5,
    idleTimeout: 60_000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    namedPlaceholders: true
  };

  // Admin/monitor users may not have access to appdb. Only set a default DB when needed.
  if (database) cfg.database = database;

  return mysql.createPool(cfg);
}

