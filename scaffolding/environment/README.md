# Docker Compose Service Library

A modular library of composable Docker Compose service definitions for Jahia test environments.

## Overview

This library provides individual service files that can be composed into a complete test environment using Docker Compose's [`include`](https://docs.docker.com/compose/how-tos/multiple-compose-files/include/) directive.

An **external composition tool** reads the service files, parses their `x-metadata` extension fields, discovers groups dynamically, and prompts the user for desired services. It then assembles the master `docker-compose.yml` with the appropriate `include` directives.

## Requirements

- **Docker Compose v2.20+** (required for `include` support)
- A `.env` file with required environment variables

## Structure

```
environment/
├── docker-compose.yml          # Master file (placeholder with shared network)
├── README.md                   # This file
└── services/                   # Individual service definitions
    ├── config.yml              # Group definitions (selection rules, ordering)
    ├── jahia.yml               # Core: Jahia processing node
    ├── jahia-browsing-a.yml    # Cluster: Browsing node A
    ├── jahia-browsing-b.yml    # Cluster: Browsing node B
    ├── jahia-browsing-c.yml    # Cluster: Browsing node C
    ├── postgres-16.yml         # Database: PostgreSQL 16
    ├── postgres-17.yml         # Database: PostgreSQL 17
    ├── postgres-18.yml         # Database: PostgreSQL 18
    ├── mariadb-10.yml          # Database: MariaDB 10
    ├── elasticsearch.yml       # Search: Elasticsearch
    ├── kibana.yml              # Search: Kibana dashboard
    ├── openldap.yml            # Directory: OpenLDAP server
    ├── mailpit.yml             # Messaging: SMTP test server
    ├── haproxy.yml             # Infrastructure: Load balancer
    └── cypress.yml             # Testing: Cypress test runner
```

## How It Works

### 1. Master Compose File

The `docker-compose.yml` defines shared infrastructure (the `stack` network) that all services attach to. The composition tool populates its `include:` section with user-selected services.

### 2. Service Files

Each file in `services/` contains:
- An `x-metadata` extension field (structured metadata for tooling)
- A `services:` section with the service definition
- Services reference the shared `stack` network (defined in the master)

**Note:** Service files are not designed to run standalone — they are compose fragments meant to be included via the master file.

### 3. Composition

The external tool generates the master file like:

```yaml
include:
  - path: ./services/jahia.yml
  - path: ./services/postgres-18.yml
  - path: ./services/cypress.yml

networks:
  stack:
```

## x-metadata Schema

Every service file includes an `x-metadata` top-level extension field. This field is **ignored by Docker Compose** but parsed by the composition tool.

```yaml
x-metadata:
  # Human-readable service name (displayed in prompts)
  name: "Service Name"

  # Description of what this service provides
  description: "What this service does and when you need it."

  # Group ID (must match a key in config.yml groups section)
  group: "group-id"

  # Dependencies: what this service needs to function
  requires:
    - service: "service-name"     # Specific service must be selected
    - group: "group-id"           # At least one service from this group must be selected

  # (Optional) Free-form notes for developers or the tool
  notes: |
    Additional context about usage or configuration.
```

## config.yml — Group Definitions

The `services/config.yml` file defines all groups with their selection rules and prompt ordering. The tool reads this file to understand how to organize and constrain the user's choices.

```yaml
groups:
  database:
    label: "Database"                           # Section header in prompts
    description: "Database backend for Jahia"   # Help text shown to user
    selection: "at_most_one"                    # Selection rule
    order: 20                                   # Sort order in prompt flow
```

### Selection Rules

| Rule | Meaning | Example |
|------|---------|---------|
| `always_included` | Auto-selected, no prompt needed | Jahia processing node |
| `at_most_one` | Optional, but only one allowed from this group | Database (or skip for Derby) |
| `zero_or_more` | Optional, pick any combination | Search, messaging, testing |

### Current Groups

| Order | Group ID | Label | Selection | Services |
|-------|----------|-------|-----------|----------|
| 10 | `core` | Jahia Core | always_included | jahia |
| 20 | `database` | Database | at_most_one | postgres-16, -17, -18, mariadb-10 |
| 30 | `cluster` | Cluster Nodes | zero_or_more | jahia-browsing-a, -b, -c |
| 40 | `search` | Search Engine | zero_or_more | elasticsearch, kibana |
| 50 | `directory` | Directory Services | zero_or_more | openldap |
| 60 | `messaging` | Messaging | zero_or_more | mailpit |
| 70 | `infrastructure` | Infrastructure | zero_or_more | haproxy |
| 80 | `testing` | Testing | zero_or_more | cypress |

### Dependencies (`requires`)

Dependencies tell the tool what must be co-selected:

- `service: "elasticsearch"` — the specific service must be included
- `group: "database"` — at least one service from that group must be included

If a user selects a service whose requirements aren't met, the tool should either auto-select the dependency or warn the user.

## Adding a New Service

1. Create a new `.yml` file in `services/`
2. Add the `x-metadata` extension field with `group` referencing a group ID from `config.yml`
3. Define the service under `services:` referencing the `stack` network
4. If this belongs to a new group, add the group definition to `config.yml`

### Template

```yaml
x-metadata:
  name: "Your Service Name"
  description: "What this service provides."
  group: "your-group"
  requires: []

services:
  your-service:
    image: your-image:tag
    container_name: your-service
    hostname: your-service
    networks:
      - stack
```

### Adding a New Group

Add a new entry to `services/config.yml`:

```yaml
groups:
  # ... existing groups ...
  caching:
    label: "Caching"
    description: "Cache backends for performance testing"
    selection: "zero_or_more"
    order: 55
```

Then reference it in your service file with `group: "caching"`. Use multiples of 10 for `order` to leave room for future insertions.

## Validation

To validate the composed environment:

```bash
# Create a test composition
cat > docker-compose.yml << 'EOF'
include:
  - path: ./services/jahia.yml
  - path: ./services/postgres-18.yml

networks:
  stack:
EOF

docker compose config
```

Individual service files cannot be validated standalone (they reference the shared `stack` network from the master file).
