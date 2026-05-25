# Docker Compose Service Library

A modular library of Docker Compose fragments for Jahia test environments.

## Overview

Each file in `environment/services/` is a compose fragment with:

- `x-metadata` (consumed by `jahia-cli`)
- a `services:` definition (consumed by Docker Compose)

The model is intentionally minimal:

- **Base services** are always started and already listed in `docker-compose.yml` includes.
- **Optional services** are marked with `x-metadata.optional: true`; `jahia-cli` can ask users whether to include them.

## Requirements

- **Docker Compose v2.20+** (required for `include` support)
- A `.env` file with required environment variables

## Structure

```text
environment/
├── docker-compose.yml          # Master file (base includes + shared network)
├── README.md                   # This file
└── services/                   # Individual service fragments
    ├── cypress.yml
    ├── elasticsearch.yml
    ├── haproxy.yml
    ├── jahia.yml
    ├── jahia-browsing-a.yml
    ├── jahia-browsing-b.yml
    ├── jahia-browsing-c.yml
    ├── jcustomer-a.yml
    ├── jcustomer-b.yml
    ├── jcustomer-c.yml
    ├── mailpit.yml
    ├── openldap.yml
    ├── postgres.yml
    └── victorialogs.yml
```

## How it works

### 1. Master compose file

`docker-compose.yml` defines shared infrastructure (`stack` network) and always includes base services.

Current base includes:

```yaml
include:
  - path: ./services/jahia.yml
  - path: ./services/postgres.yml
  - path: ./services/victorialogs.yml
```

### 2. Optional services

Services with `x-metadata.optional: true` are optional containers that `jahia-cli` can propose during initialization.

### 3. Base logging services

`victorialogs.yml` is a base include containing:

- `victorialogs` (log storage/query service, port `9428`)
- `promtail` (collector that ships container logs)

Log flow:

`containers -> promtail -> victorialogs`

### 4. Final composition

`jahia-cli` can build a final include list by keeping base services and appending selected optional services.

Example:

```yaml
include:
  - path: ./services/jahia.yml
  - path: ./services/postgres.yml
  - path: ./services/victorialogs.yml
  - path: ./services/mailpit.yml
  - path: ./services/cypress.yml

networks:
  stack:
```

## x-metadata schema

`x-metadata` is ignored by Docker Compose and parsed by `jahia-cli`.

```yaml
x-metadata:
  name: "Service Name"
  description: "What this service provides."
  optional: true # Optional; when true this service is user-selectable
```

Rules:

- `name` and `description` are always expected.
- `optional` is omitted for base services.
- `optional: true` marks user-selectable containers.
- Base logging endpoint is available at `http://victorialogs:9428`.

## Adding a new service

1. Create a new `.yml` file in `services/`.
2. Add `x-metadata.name` and `x-metadata.description`.
3. Add `optional: true` if the service should be selectable.
4. Define the service under `services:` and attach it to `stack`.

Template:

```yaml
x-metadata:
  name: "Your Service Name"
  description: "What this service provides."
  optional: true

services:
  your-service:
    image: your-image:tag
    container_name: your-service
    hostname: your-service
    networks:
      - stack
```

## Validation

To validate the composed environment:

```bash
docker compose -f docker-compose.yml config
```

Individual service files cannot be validated standalone because they depend on the shared `stack` network defined in the master file.
