export class ItemsService {
  constructor(itemsRepo, logger) {
    this.itemsRepo = itemsRepo;
    this.logger = logger;
  }

  async write({ id, name }) {
    if (!name || typeof name !== "string") {
      const err = new Error("Body must include { name: string } (and optional id)");
      err.statusCode = 400;
      throw err;
    }

    if (id) {
      const { affectedRows } = await this.itemsRepo.updateOnMaster(id, name);
      this.logger.info(`write master: UPDATE id=${id} affected=${affectedRows}`);
      return { ok: true, op: "update", id, affectedRows };
    }

    const { insertId } = await this.itemsRepo.insertOnMaster(name);
    this.logger.info(`write master: INSERT id=${insertId}`);
    return { ok: true, op: "insert", id: insertId };
  }

  async readReplica(replicaName) {
    const rows = await this.itemsRepo.listRecentFromReplica(replicaName, 20);
    this.logger.info(`read ${replicaName}: rows=${rows.length}`);
    return rows;
  }
}

