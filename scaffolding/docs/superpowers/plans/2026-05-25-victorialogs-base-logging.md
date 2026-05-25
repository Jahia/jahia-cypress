# VictoriaLogs Base Logging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a base VictoriaLogs logging stack that is always included and captures logs from running Docker containers.

**Architecture:** Introduce a new base compose fragment containing `victorialogs` (storage/query) and `promtail` (log collector). Keep metadata consistent with the simplified model (`name`, `description`, no `optional` for base). Wire the new base fragment into the master `docker-compose.yml` include list and document the behavior in `environment/README.md`.

**Tech Stack:** Docker Compose fragments, VictoriaLogs, Promtail, YAML configuration

---

### Task 1: Add VictoriaLogs base service fragment

**Files:**
- Create: `environment/services/victorialogs.yml`
- Create: `environment/services/victorialogs/promtail.yml`
- Test: `environment/services/victorialogs.yml` via `docker compose config`

- [ ] **Step 1: Write the failing test**

Create a temporary check script snippet (or run direct command) that fails before files exist:

```bash
cd /Users/fgerthoffert/GitHub/Jahia/jahia-cypress/scaffolding/environment
test -f services/victorialogs.yml && test -f services/victorialogs/promtail.yml
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd /Users/fgerthoffert/GitHub/Jahia/jahia-cypress/scaffolding/environment
test -f services/victorialogs.yml && test -f services/victorialogs/promtail.yml
```

Expected: command exits non-zero because files are missing.

- [ ] **Step 3: Write minimal implementation**

Create `environment/services/victorialogs.yml`:

```yaml
x-metadata:
  name: "VictoriaLogs"
  description: "Centralized log storage and collection via VictoriaLogs + Promtail."

services:
  victorialogs:
    image: victoriametrics/victoria-logs:v1.23.1-victorialogs
    container_name: victorialogs
    hostname: victorialogs
    networks:
      - stack
    ports:
      - "9428:9428"
    command:
      - "-storageDataPath=/victoria-logs-data"
    volumes:
      - victorialogs-data:/victoria-logs-data

  promtail:
    image: grafana/promtail:3.1.1
    container_name: promtail
    hostname: promtail
    networks:
      - stack
    command: "-config.file=/etc/promtail/promtail.yml"
    volumes:
      - ./services/victorialogs/promtail.yml:/etc/promtail/promtail.yml:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro

volumes:
  victorialogs-data:
```

Create `environment/services/victorialogs/promtail.yml`:

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://victorialogs:9428/insert/loki/api/v1/push

scrape_configs:
  - job_name: docker
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s
    relabel_configs:
      - source_labels: ["__meta_docker_container_name"]
        regex: "/(.*)"
        target_label: "container"
      - source_labels: ["__meta_docker_container_id"]
        target_label: "__path__"
        replacement: "/var/lib/docker/containers/$1/$1-json.log"
      - source_labels: ["__meta_docker_container_log_stream"]
        target_label: "stream"
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
cd /Users/fgerthoffert/GitHub/Jahia/jahia-cypress/scaffolding/environment
test -f services/victorialogs.yml && test -f services/victorialogs/promtail.yml
```

Expected: command exits 0.

- [ ] **Step 5: Commit**

```bash
cd /Users/fgerthoffert/GitHub/Jahia/jahia-cypress/scaffolding
git add environment/services/victorialogs.yml environment/services/victorialogs/promtail.yml
git commit -m "feat(environment): add victorialogs base logging fragment"
```

### Task 2: Include VictoriaLogs as a base service

**Files:**
- Modify: `environment/docker-compose.yml`
- Test: `environment/docker-compose.yml` include section

- [ ] **Step 1: Write the failing test**

```bash
cd /Users/fgerthoffert/GitHub/Jahia/jahia-cypress/scaffolding
rg -n "services/victorialogs.yml" environment/docker-compose.yml
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd /Users/fgerthoffert/GitHub/Jahia/jahia-cypress/scaffolding
rg -n "services/victorialogs.yml" environment/docker-compose.yml
```

Expected: no matches.

- [ ] **Step 3: Write minimal implementation**

Update include section in `environment/docker-compose.yml`:

```yaml
include:
  - path: ./services/jahia.yml
  - path: ./services/postgres.yml
  - path: ./services/victorialogs.yml
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
cd /Users/fgerthoffert/GitHub/Jahia/jahia-cypress/scaffolding
rg -n "services/victorialogs.yml" environment/docker-compose.yml
```

Expected: one match in include section.

- [ ] **Step 5: Commit**

```bash
cd /Users/fgerthoffert/GitHub/Jahia/jahia-cypress/scaffolding
git add environment/docker-compose.yml
git commit -m "feat(environment): include victorialogs as base service"
```

### Task 3: Update documentation for base logging flow

**Files:**
- Modify: `environment/README.md`
- Test: `environment/README.md` content checks

- [ ] **Step 1: Write the failing test**

```bash
cd /Users/fgerthoffert/GitHub/Jahia/jahia-cypress/scaffolding
rg -n "victorialogs|promtail|containers -> promtail -> victorialogs" environment/README.md
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd /Users/fgerthoffert/GitHub/Jahia/jahia-cypress/scaffolding
rg -n "victorialogs|promtail|containers -> promtail -> victorialogs" environment/README.md
```

Expected: no matches for at least one required concept.

- [ ] **Step 3: Write minimal implementation**

Update `environment/README.md`:
1. Add `victorialogs.yml` to the structure list.
2. Add `./services/victorialogs.yml` to base include examples.
3. Add a short section describing:
   - `victorialogs` as base service
   - `promtail` shipping logs
   - flow: `containers -> promtail -> victorialogs`
   - endpoint: `http://victorialogs:9428`

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
cd /Users/fgerthoffert/GitHub/Jahia/jahia-cypress/scaffolding
rg -n "victorialogs|promtail|containers -> promtail -> victorialogs|http://victorialogs:9428" environment/README.md
```

Expected: matches for all required concepts.

- [ ] **Step 5: Commit**

```bash
cd /Users/fgerthoffert/GitHub/Jahia/jahia-cypress/scaffolding
git add environment/README.md
git commit -m "docs(environment): document victorialogs base logging flow"
```

### Task 4: Validate compose and metadata consistency

**Files:**
- Test: `environment/docker-compose.yml`
- Test: `environment/services/*.yml`

- [ ] **Step 1: Write the failing test**

Run relationship-key check (should remain clean):

```bash
cd /Users/fgerthoffert/GitHub/Jahia/jahia-cypress/scaffolding
rg -n "^[[:space:]]+(group|requires):" environment/services/*.yml
```

- [ ] **Step 2: Run test to verify expected baseline**

Run:

```bash
cd /Users/fgerthoffert/GitHub/Jahia/jahia-cypress/scaffolding
rg -n "^[[:space:]]+(group|requires):" environment/services/*.yml
```

Expected: no matches.

- [ ] **Step 3: Run compose validation**

Run:

```bash
cd /Users/fgerthoffert/GitHub/Jahia/jahia-cypress/scaffolding/environment
JCLI_JAHIA_IMAGE=jahia/jahia-ee:8 docker compose -f docker-compose.yml config >/tmp/jahia-compose-config.out
```

Expected: exit code 0.

- [ ] **Step 4: Run lint command available in repo**

Run:

```bash
cd /Users/fgerthoffert/GitHub/Jahia/jahia-cypress/scaffolding
yarn run lint
```

Expected: if it fails due known workspace lockfile mismatch, record as pre-existing environment issue; otherwise require pass.

- [ ] **Step 5: Commit**

```bash
cd /Users/fgerthoffert/GitHub/Jahia/jahia-cypress/scaffolding
git add environment/docker-compose.yml environment/services/victorialogs.yml environment/services/victorialogs/promtail.yml environment/README.md
git commit -m "feat(environment): add base victorialogs stack with promtail collection"
```
