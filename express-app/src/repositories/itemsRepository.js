export class ItemsRepository {
  constructor(masterPool, replicaPoolsByName) {
    this.masterPool = masterPool;
    this.replicaPoolsByName = replicaPoolsByName;
  }

  async ensureSchema() {
    await this.masterPool.query(`
      CREATE TABLE IF NOT EXISTS items (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        version INT NOT NULL DEFAULT 1,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_updated_at (updated_at)
      )
    `);
  }

  async insertOnMaster(name) {
    const [result] = await this.masterPool.execute(`INSERT INTO items (name) VALUES (?)`, [name]);
    return { insertId: result.insertId };
  }

  async updateOnMaster(id, name) {
    const [result] = await this.masterPool.execute(
      `UPDATE items SET name = ?, version = version + 1 WHERE id = ?`,
      [name, id]
    );
    return { affectedRows: result.affectedRows };
  }

  async listRecentFromReplica(replicaName, limit = 20) {
    const pool = this.replicaPoolsByName.get(replicaName);
    if (!pool) throw new Error(`Unknown replica ${replicaName}`);
    const [rows] = await pool.query(
      `SELECT id, name, version, updated_at FROM items ORDER BY id DESC LIMIT ?`,
      [limit]
    );
    return rows;
  }
}

