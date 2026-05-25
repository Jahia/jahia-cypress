# VictoriaLogs Base Logging Design

## Goal
Add a base logging capability that is always present in generated environments and captures logs from running containers without reintroducing metadata complexity.

## Context
The environment model was simplified to base services plus optional services. `jahia.yml` and `postgres.yml` are base includes in `environment/docker-compose.yml`. We need to add `victorialogs` as another base include and ensure logs are automatically shipped from running containers.

## Design

### Components
1. **VictoriaLogs service** (`victorialogs`)
   - Stores and serves logs.
   - Exposes HTTP API on port `9428`.

2. **Promtail service** (`promtail`)
   - Discovers Docker containers.
   - Reads container logs.
   - Pushes logs to VictoriaLogs via Loki-compatible endpoint.

### Service definition model
- Create a new base fragment: `environment/services/victorialogs.yml`.
- `x-metadata` remains minimal:
  - `name`
  - `description`
- No `optional` flag, because this is a base service.

### Compose inclusion
- Update `environment/docker-compose.yml` include section to always include:
  - `./services/jahia.yml`
  - `./services/postgres.yml`
  - `./services/victorialogs.yml`

### Log flow
1. Application containers write container logs.
2. `promtail` discovers running containers via Docker metadata.
3. `promtail` tails logs and sends them to `victorialogs`.
4. Logs are queryable through VictoriaLogs API.

## Documentation updates
- Update `environment/README.md` to:
  - list `victorialogs.yml` in service structure,
  - show it in base include examples,
  - explain the capture flow (containers -> promtail -> victorialogs),
  - mention the base endpoint for log access.

## Validation plan
1. `docker compose -f environment/docker-compose.yml config` resolves successfully.
2. `environment/docker-compose.yml` contains base include for `victorialogs.yml`.
3. `environment/services/victorialogs.yml` uses minimal base metadata (`name`, `description`).
4. README reflects base inclusion and logging flow.

## Scope boundaries
- In scope:
  - Base logging stack (VictoriaLogs + Promtail) for automatic container log ingestion.
- Out of scope:
  - Advanced retention policies and access control tuning.
  - UI dashboards or additional observability stack components.
