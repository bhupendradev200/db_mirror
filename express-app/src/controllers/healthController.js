export function healthController() {
  return (_req, res) => {
    res.json({ ok: true, ts: new Date().toISOString() });
  };
}

