export function adminController(replicationService) {
  return {
    induceLag: async (req, res) => {
      const replica = req.params.replica;
      const seconds = Number(req.query.seconds ?? "10");
      const result = await replicationService.induceLag(replica, seconds);
      res.json(result);
    }
  };
}

