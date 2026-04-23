## Monitoring (Production-style): Grafana + Prometheus + Loki + Promtail + cAdvisor

This project ships an **optional** monitoring stack that lets you:

- **Search Express logs in Grafana** (via Loki)
- **Monitor per-container metrics** (via cAdvisor → Prometheus → Grafana)
- **Monitor Express API metrics** (via `/metrics` → Prometheus → Grafana)

### What gets deployed

- **Grafana**: dashboards and log search UI  
  - URL: `http://localhost:3001`
  - Login: `admin` / `admin`
- **Prometheus**: metrics TSDB  
  - URL: `http://localhost:9090`
- **cAdvisor**: container metrics exporter  
  - URL: `http://localhost:8080`
- **Loki**: log store + query backend  
  - URL: `http://localhost:3100`
- **Promtail**: ships Docker logs → Loki

### Start monitoring stack

From repo root:

```bash
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d --build
```

### Verify Express metrics endpoint

```bash
curl.exe -s http://localhost:3000/metrics
```

You should see Prometheus format metrics (counters/histograms).

### Grafana: search Express logs

1) Open Grafana: `http://localhost:3001`
2) Go to **Explore**
3) Select datasource **Loki**
4) Query only Express logs (container label comes from Docker discovery):

```
{container="express-app"}
```

Filter for specific messages:

```
{container="express-app"} |= "write master"
```

### Prometheus: check scrape targets

Open: `http://localhost:9090/targets`

You should see:
- `express-app` up
- `cadvisor` up

### What metrics you get

From Express (`/metrics`):
- `http_requests_total{method,route,status_code}`
- `http_request_duration_seconds_bucket{method,route,status_code}`

From cAdvisor:
- CPU, memory, network, disk metrics for each container (great for “per container utilization”)

### Notes / Production reality

- **Prometheus + Grafana** is the standard for metrics.
- **Loki** is optional but ideal when you want **searchable logs inside Grafana**.
- For higher-fidelity logs, prefer structured JSON logs and include request IDs for correlation.

