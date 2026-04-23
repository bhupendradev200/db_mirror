export function itemsController(itemsService) {
  return {
    write: async (req, res) => {
      const result = await itemsService.write(req.body || {});
      res.json(result);
    },
    readReplica: (replicaName) => async (_req, res) => {
      const rows = await itemsService.readReplica(replicaName);
      res.json(rows);
    }
  };
}

