# Docker Compose Service Library

A library of re-usable Docker Compose service fragments for Jahia test environments. Users customize their setup by selecting which services to include alongside the base stack.

## Overview

The goal of this library is to provide a collection of pre-configured, re-usable services that users can mix and match to build the environment they need. The master `docker-compose.yml` remains a simple **Jahia + PostgreSQL + VictoriaLogs** baseline that users expand by adding services from the `services/` folder to the `include` section.

## Requirements

- **Docker Compose v2.20+** (required for `include` support)
- A `.env` file with required environment variables

## Structure

```text
environment/
├── docker-compose.yml          # Master file (base includes + shared network)
├── README.md                   # This file
└── services/                   # Re-usable service fragments
    ├── cypress.yml
    ├── elasticsearch.yml
    ├── haproxy.yml
    ├── jahia.yml
    └── ... and more!
```

## How it works

### 1. Master compose file

`docker-compose.yml` provides the minimal base environment: **Jahia**, **PostgreSQL**, and **VictoriaLogs** (centralized logging). It also defines the shared `stack` network that all services attach to.

```yaml
include:
  - path: ./services/victorialogs.yml
  - path: ./services/jahia.yml
  - path: ./services/postgres.yml

networks:
  stack:
    driver: bridge
    ipam:
      config:
        - subnet: 172.31.24.0/24
```

This file should always remain a simple, predictable starting point. All customization happens by adding entries to the `include` list.

### 2. Service fragments

Each file in `services/` is a self-contained Docker Compose fragment that defines one or more related containers. Services attach to the shared `stack` network so they can communicate with each other and with the base services.

### 3. Customizing your environment

To add services to your environment, append them to the `include` section in `docker-compose.yml`:

```yaml
include:
  - path: ./services/victorialogs.yml
  - path: ./services/jahia.yml
  - path: ./services/postgres.yml
  # Add the services you need below
  - path: ./services/mailpit.yml
  - path: ./services/cypress.yml
  - path: ./services/elasticsearch.yml
```

This keeps the master file readable and makes it easy to see exactly which services are active.

### 4. Centralized logging

`victorialogs.yml` is part of the base stack and provides:

- **VictoriaLogs** — log storage and query service (port `9428`)
- **Promtail** — collector that ships container logs to VictoriaLogs

Log flow: `containers → promtail → victorialogs`

All services automatically benefit from centralized logging without additional configuration.

## Adding a new service

1. Create a new `.yml` file in `services/`.
2. Define the service under `services:` and attach it to the `stack` network.
3. Keep the fragment self-contained — it should work when included from the master file without modifications.

Template:

```yaml
services:
  your-service:
    image: your-image:tag
    container_name: your-service
    hostname: your-service
    networks:
      - stack

networks:
  stack:
    external: true
```

## Validation

To validate the composed environment:

```bash
docker compose -f docker-compose.yml config
```

Individual service files cannot be validated standalone because they depend on the shared `stack` network defined in the master file.
