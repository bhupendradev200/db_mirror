export class ReplicationService {
  constructor({ replicaMonitors, replicaAdmins }, replicationStatusRepo, logger) {
    this.replicaMonitors = replicaMonitors;
    this.replicaAdmins = replicaAdmins;
    this.replicationStatusRepo = replicationStatusRepo;
    this.logger = logger;
  }

  async getStatus() {
    const results = await Promise.all(
      this.replicaMonitors.map(async (r) => {
        const row = await this.replicationStatusRepo.showStatusRow(r.monitorPool);
        return { replica: r.name, ...this.replicationStatusRepo.pickFields(row) };
      })
    );
    return results;
  }

  async induceLag(replicaName, seconds) {
    const r = this.replicaAdmins.find((x) => x.name === replicaName);
    if (!r) {
      const err = new Error(`Unknown replica ${replicaName}`);
      err.statusCode = 404;
      throw err;
    }

    const s = Math.max(0, Math.min(600, Number.isFinite(seconds) ? seconds : 10));
    this.logger.info(`induce-lag ${replicaName}: pausing SQL thread for ${s}s`);

    await r.adminPool.query("STOP SLAVE SQL_THREAD");
    await r.adminPool.query("DO SLEEP(?)", [s]);
    await r.adminPool.query("START SLAVE SQL_THREAD");
    return { ok: true, replica: replicaName, seconds: s };
  }
}

