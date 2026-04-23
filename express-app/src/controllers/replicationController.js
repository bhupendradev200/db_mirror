export function replicationController(replicationService, logger) {
  return {
    status: async (_req, res) => {
      const replicas = await replicationService.getStatus();
      const compact = replicas
        .map((x) => `${x.replica}: lag=${x.Seconds_Behind_Master ?? "null"}s io=${x.Slave_IO_Running} sql=${x.Slave_SQL_Running}`)
        .join(" | ");
      logger.info(`replication-status ${compact}`);
      res.json({ ts: new Date().toISOString(), replicas });
    }
  };
}

