import { nowIso } from "./time.js";

export function createLogger() {
  return {
    info: (msg) => console.log(`[${nowIso()}] ${msg}`),
    error: (msg, err) => console.error(`[${nowIso()}] ${msg}`, err ?? "")
  };
}

