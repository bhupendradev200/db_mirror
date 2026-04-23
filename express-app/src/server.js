import { loadConfig } from "./config/env.js";
import { createPools } from "./db/pools.js";
import { createLogger } from "./lib/logger.js";
import { createApp } from "./app.js";

import { ItemsRepository } from "./repositories/itemsRepository.js";
import { ReplicationStatusRepository } from "./repositories/replicationStatusRepository.js";

import { ItemsService } from "./services/itemsService.js";
import { ReplicationService } from "./services/replicationService.js";

async function main() {
  const config = loadConfig();
  const logger = createLogger();

  const pools = createPools(config);
  const replicaPoolsByName = new Map(pools.replicas.map((r) => [r.name, r.pool]));

  const itemsRepo = new ItemsRepository(pools.master, replicaPoolsByName);
  await itemsRepo.ensureSchema();

  const itemsService = new ItemsService(itemsRepo, logger);

  const replicationStatusRepo = new ReplicationStatusRepository();
  const replicationService = new ReplicationService(
    { replicaMonitors: pools.replicaMonitors, replicaAdmins: pools.replicaAdmins },
    replicationStatusRepo,
    logger
  );

  const app = createApp({
    itemsService,
    replicationService,
    itemsRepo,
    replicas: pools.replicas,
    logger
  });

  app.listen(config.port, () => logger.info(`API listening on :${config.port}`));

  if (config.logReplicationPollMs > 0) {
    setInterval(async () => {
      try {
        const status = await replicationService.getStatus();
        const compact = status.map((x) => `${x.replica}:${x.Seconds_Behind_Master ?? "null"}s`).join(" ");
        logger.info(`lag-poll ${compact}`);
      } catch (e) {
        logger.error("lag-poll error", e);
      }
    }, config.logReplicationPollMs).unref?.();
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error("Fatal startup error", e);
  process.exit(1);
});

