export class ReplicationStatusRepository {
  async showStatusRow(monitorPool) {
    const queries = ["SHOW REPLICA STATUS", "SHOW SLAVE STATUS"];
    for (const q of queries) {
      try {
        const [rows] = await monitorPool.query(q);
        if (Array.isArray(rows) && rows.length > 0) return rows[0];
      } catch (_e) {
        // ignore and try next
      }
    }
    return null;
  }

  pickFields(row) {
    if (!row) {
      return {
        Seconds_Behind_Master: null,
        Relay_Log_Pos: null,
        Exec_Master_Log_Pos: null,
        Relay_Master_Log_File: null,
        Master_Log_File: null,
        Slave_IO_Running: null,
        Slave_SQL_Running: null,
        Last_SQL_Error: null,
        Last_IO_Error: null
      };
    }

    // Normalize MySQL 8 terminology -> legacy keys expected by the API response
    const secondsBehind = row.Seconds_Behind_Master ?? row.Seconds_Behind_Source ?? null;
    const relayLogPos = row.Relay_Log_Pos ?? null;
    const execPos = row.Exec_Master_Log_Pos ?? row.Exec_Source_Log_Pos ?? null;
    const relayMasterFile = row.Relay_Master_Log_File ?? row.Relay_Source_Log_File ?? null;
    const masterFile = row.Master_Log_File ?? row.Source_Log_File ?? null;
    const ioRunning = row.Slave_IO_Running ?? row.Replica_IO_Running ?? null;
    const sqlRunning = row.Slave_SQL_Running ?? row.Replica_SQL_Running ?? null;

    return {
      Seconds_Behind_Master: secondsBehind,
      Relay_Log_Pos: relayLogPos,
      Exec_Master_Log_Pos: execPos,
      Relay_Master_Log_File: relayMasterFile,
      Master_Log_File: masterFile,
      Slave_IO_Running: ioRunning,
      Slave_SQL_Running: sqlRunning,
      Last_SQL_Error: row.Last_SQL_Error ?? null,
      Last_IO_Error: row.Last_IO_Error ?? null
    };
  }
}

