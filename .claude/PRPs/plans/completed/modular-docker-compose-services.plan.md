# Plan: Modular Docker Compose Service Library

## Summary
Create a modular library of docker-compose service files in `scaffolding/environment/services/` with a master `docker-compose.yml` placeholder. Each service file is a standalone compose file with `x-metadata` extension fields for tooling integration, using Docker Compose `include` for composition.

## User Story
As a Jahia developer/QA/CI pipeline,
I want to select services from a reusable catalog,
So that I can compose consistent test environments without maintaining duplicate definitions.

## Problem → Solution
Each project maintains its own full docker-compose with duplicated, drifting service definitions → Centralized, metadata-enriched service catalog composed via Docker Compose `include`.

## Metadata
- **Complexity**: Medium
- **Source PRD**: `.claude/PRPs/prds/modular-docker-compose-services.prd.md`
- **PRD Phase**: All phases (1-4 combined — tightly coupled deliverable)
- **Estimated Files**: 14

---

## UX Design

N/A — internal infrastructure change. No user-facing UI.

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | (reference) user-password-auth compose | all | Jahia + SMTP pattern |
| P0 | (reference) jahia-ee dc-pgsql-18 compose | all | PostgreSQL + cluster pattern |
| P0 | (reference) augmented-search compose | all | Full stack (MariaDB + ES + Kibana + HAProxy) |

All three were fetched during PRD research and their content is captured below in Patterns to Mirror.

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| Docker Compose `include` | docs.docker.com/compose/how-tos/multiple-compose-files/include/ | Each included file loads as individual model; resources copied into parent; conflicts produce warnings |
| `include` reference | docs.docker.com/reference/compose-file/include/ | Supports `path`, `project_directory`, `env_file`; short and long syntax |
| `x-` extensions | docs.docker.com/reference/compose-file/extensions/ | Top-level or nested `x-` fields are ignored by Docker Compose but parseable by tools |

---

## Patterns to Mirror

### NETWORK_PATTERN
```yaml
# SOURCE: All reference compose files
networks:
  stack:
```
Every service file defines the same `stack` network to be independently valid.

### JAHIA_PROCESSING_PATTERN
```yaml
# SOURCE: augmented-search/tests/docker-compose.yml (jahia service)
services:
  jahia:
    image: '${JAHIA_IMAGE}'
    container_name: jahia
    hostname: jahia
    restart: 'no'
    deploy:
      resources:
        limits:
          memory: 4gb
    networks:
      - stack
    ports:
      - "8080:8080"
      - "8101:8101"
      - "8000:8000"
    extra_hosts:
      - jahia:127.0.0.1
    environment:
      jahia_cfg_karaf_remoteShellHost: 0.0.0.0
      DB_VENDOR: mariadb
      DB_HOST: mariadb
      DB_NAME: jahia
      DB_USER: jahia
      DB_PASS: jahia
      JAHIA_LICENSE: ${JAHIA_LICENSE}
      SUPER_USER_PASSWORD: ${SUPER_USER_PASSWORD}
      MAX_RAM_PERCENTAGE: 95
      RESTORE_MODULE_STATES: 'false'
      JPDA: 'true'
```

### DATABASE_POSTGRES_PATTERN
```yaml
# SOURCE: jahia-ee/docker-tests/dc-pgsql-18.yml
services:
  database:
    image: postgres:18-alpine
    container_name: database
    networks:
      - stack
    environment:
      - POSTGRES_DB=jahia
      - POSTGRES_USER=jahia
      - POSTGRES_PASSWORD=jahia
```

### DATABASE_MARIADB_PATTERN
```yaml
# SOURCE: augmented-search/tests/docker-compose.yml
services:
  mariadb:
    image: library/mariadb:10-jammy
    container_name: mariadb
    hostname: mariadb
    deploy:
      resources:
        limits:
          memory: 1gb
    networks:
      - stack
    command: --max_allowed_packet=1073741824 --transaction-isolation=READ-UNCOMMITTED --innodb-lock-wait-timeout=10
    environment:
      MYSQL_ROOT_PASSWORD: root1234
      MYSQL_DATABASE: jahia
      MYSQL_USER: jahia
      MYSQL_PASSWORD: jahia
```

### ELASTICSEARCH_PATTERN
```yaml
# SOURCE: augmented-search/tests/docker-compose.yml
services:
  elasticsearch:
    image: '${ELASTICSEARCH_IMAGE}'
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=true
      - ELASTIC_PASSWORD=${SUPER_USER_PASSWORD}
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms2g -Xmx2g"
    container_name: elasticsearch
    hostname: elasticsearch
    deploy:
      resources:
        limits:
          memory: 3gb
    ports:
      - '9200:9200'
    ulimits:
      memlock:
        soft: -1
        hard: -1
    networks:
      - stack
```

### METADATA_PATTERN
```yaml
# Custom pattern for this project — x-metadata extension field
x-metadata:
  name: "Human-readable service name"
  description: "What this service provides"
  category: "category-slug"
  required: false
  depends_on_services: []
  environment_variables:
    required: []
    optional: []
  ports:
    - "8080: Jahia web interface"
```

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `scaffolding/environment/docker-compose.yml` | CREATE | Master placeholder with shared network |
| `scaffolding/environment/services/jahia.yml` | CREATE | Core Jahia processing node |
| `scaffolding/environment/services/postgres-16.yml` | CREATE | PostgreSQL 16 database |
| `scaffolding/environment/services/postgres-17.yml` | CREATE | PostgreSQL 17 database |
| `scaffolding/environment/services/postgres-18.yml` | CREATE | PostgreSQL 18 database |
| `scaffolding/environment/services/mariadb-10.yml` | CREATE | MariaDB 10 database |
| `scaffolding/environment/services/cypress.yml` | CREATE | Cypress test runner |
| `scaffolding/environment/services/elasticsearch.yml` | CREATE | Elasticsearch search engine |
| `scaffolding/environment/services/mailpit.yml` | CREATE | SMTP test server |
| `scaffolding/environment/services/kibana.yml` | CREATE | Elasticsearch UI |
| `scaffolding/environment/services/haproxy.yml` | CREATE | Load balancer for cluster |
| `scaffolding/environment/services/jahia-browsing.yml` | CREATE | Jahia browsing/cluster node |
| `scaffolding/environment/README.md` | CREATE | Documentation for the library |

## NOT Building

- The composition tool/script (external, not in codebase)
- Runtime health checks beyond Docker defaults
- Production deployment configs
- Service discovery or dynamic scaling
- HAProxy config files (just the compose service definition)

---

## Step-by-Step Tasks

### Task 1: Create master docker-compose.yml
- **ACTION**: Create `scaffolding/environment/docker-compose.yml` with shared network definition and documented include placeholder
- **IMPLEMENT**: Define `networks: stack:`, add commented `include:` section showing how the tool will populate it, add header documentation
- **MIRROR**: NETWORK_PATTERN
- **GOTCHA**: The master must be valid YAML even as a placeholder (the `include` section should be commented out or use an example)
- **VALIDATE**: `docker compose -f scaffolding/environment/docker-compose.yml config` passes

### Task 2: Create Jahia processing service
- **ACTION**: Create `scaffolding/environment/services/jahia.yml`
- **IMPLEMENT**: Jahia processing node with DB_VENDOR/DB_HOST as env vars (database-agnostic), x-metadata with category "core"
- **MIRROR**: JAHIA_PROCESSING_PATTERN, METADATA_PATTERN
- **GOTCHA**: Don't hardcode DB_VENDOR — it must be configurable via env var so it works with any database service. Use `depends_on` metadata to indicate it needs a database but don't specify which.
- **VALIDATE**: Valid YAML, passes `docker compose -f ... config`

### Task 3: Create PostgreSQL 16 service
- **ACTION**: Create `scaffolding/environment/services/postgres-16.yml`
- **IMPLEMENT**: PostgreSQL 16 with standard Jahia DB credentials
- **MIRROR**: DATABASE_POSTGRES_PATTERN, METADATA_PATTERN
- **GOTCHA**: Use `postgres:16-alpine` image. Category "database". Mark as mutually exclusive with other DB services in metadata.
- **VALIDATE**: Valid YAML

### Task 4: Create PostgreSQL 17 service
- **ACTION**: Create `scaffolding/environment/services/postgres-17.yml`
- **IMPLEMENT**: Same as Task 3 but with `postgres:17-alpine`
- **MIRROR**: DATABASE_POSTGRES_PATTERN, METADATA_PATTERN
- **VALIDATE**: Valid YAML

### Task 5: Create PostgreSQL 18 service
- **ACTION**: Create `scaffolding/environment/services/postgres-18.yml`
- **IMPLEMENT**: Same as Task 3 but with `postgres:18-alpine`
- **MIRROR**: DATABASE_POSTGRES_PATTERN, METADATA_PATTERN
- **VALIDATE**: Valid YAML

### Task 6: Create MariaDB 10 service
- **ACTION**: Create `scaffolding/environment/services/mariadb-10.yml`
- **IMPLEMENT**: MariaDB 10 with custom command flags, Jahia DB credentials
- **MIRROR**: DATABASE_MARIADB_PATTERN, METADATA_PATTERN
- **GOTCHA**: Include the `--max_allowed_packet` and `--transaction-isolation` flags from reference. Category "database", mutually exclusive with postgres services.
- **VALIDATE**: Valid YAML

### Task 7: Create Cypress test runner service
- **ACTION**: Create `scaffolding/environment/services/cypress.yml`
- **IMPLEMENT**: Cypress container with `ipc: host`, standard test env vars
- **MIRROR**: METADATA_PATTERN (cypress pattern from reference files)
- **GOTCHA**: Include `ipc: host` (required for Cypress). Category "testing".
- **VALIDATE**: Valid YAML

### Task 8: Create Elasticsearch service
- **ACTION**: Create `scaffolding/environment/services/elasticsearch.yml`
- **IMPLEMENT**: Single-node ES with security, memory locks, resource limits
- **MIRROR**: ELASTICSEARCH_PATTERN, METADATA_PATTERN
- **GOTCHA**: Must include `ulimits.memlock` for production-like behavior. Category "search".
- **VALIDATE**: Valid YAML

### Task 9: Create Mailpit service
- **ACTION**: Create `scaffolding/environment/services/mailpit.yml`
- **IMPLEMENT**: Mailpit SMTP test server on ports 1025/8025
- **MIRROR**: METADATA_PATTERN (mailpit pattern from user-password-auth)
- **GOTCHA**: Category "messaging". Expose both SMTP (1025) and web UI (8025) ports.
- **VALIDATE**: Valid YAML

### Task 10: Create Kibana service
- **ACTION**: Create `scaffolding/environment/services/kibana.yml`
- **IMPLEMENT**: Kibana connected to elasticsearch, with security enabled
- **MIRROR**: METADATA_PATTERN (kibana from augmented-search)
- **GOTCHA**: Must depend on elasticsearch service. Category "search". Port 5601.
- **VALIDATE**: Valid YAML

### Task 11: Create HAProxy service
- **ACTION**: Create `scaffolding/environment/services/haproxy.yml`
- **IMPLEMENT**: HAProxy load balancer service definition
- **MIRROR**: METADATA_PATTERN
- **GOTCHA**: Category "infrastructure". Depends on jahia-browsing. Note that HAProxy config is project-specific — the compose file uses a build context placeholder.
- **VALIDATE**: Valid YAML

### Task 12: Create Jahia browsing node service
- **ACTION**: Create `scaffolding/environment/services/jahia-browsing.yml`
- **IMPLEMENT**: Jahia browsing node (PROCESSING_SERVER=false, PROCESSING_HOST=jahia)
- **MIRROR**: JAHIA_PROCESSING_PATTERN (modified for browsing), METADATA_PATTERN
- **GOTCHA**: Port 8081 to avoid conflict with processing node. Category "core". Depends on jahia service.
- **VALIDATE**: Valid YAML

### Task 13: Create README documentation
- **ACTION**: Create `scaffolding/environment/README.md`
- **IMPLEMENT**: Document: purpose, structure, metadata schema, how to add new services, how the tool uses this library, Docker Compose version requirements
- **GOTCHA**: Include the full x-metadata schema specification. Document mutual exclusivity groups (databases).
- **VALIDATE**: Readable, complete

---

## Testing Strategy

### Validation Tests

| Test | Command | Expected Output |
|---|---|---|
| Master compose valid | `docker compose -f environment/docker-compose.yml config` | Valid YAML output, no errors |
| Each service file valid | `docker compose -f environment/services/X.yml config` | Valid YAML output per file |
| YAML lint | Parse each file as YAML | No syntax errors |

### Edge Cases Checklist
- [x] Network definition consistent across all files
- [x] No port conflicts between services that would commonly run together
- [x] Environment variable substitution syntax correct
- [x] x-metadata doesn't interfere with Docker Compose parsing
- [x] Files are independently valid compose files

---

## Validation Commands

### YAML Validity
```bash
# Validate each compose file
for f in scaffolding/environment/docker-compose.yml scaffolding/environment/services/*.yml; do
  echo "Checking $f..."
  docker compose -f "$f" config > /dev/null 2>&1 && echo "  OK" || echo "  FAILED"
done
```
EXPECT: All files report OK

### Manual Validation
- [ ] Each service file has x-metadata with name, description, category
- [ ] Database services marked as mutually exclusive
- [ ] All env vars use `${VAR}` substitution (no hardcoded secrets)
- [ ] README documents the metadata schema completely

---

## Acceptance Criteria
- [ ] Master docker-compose.yml exists with shared network and documented include pattern
- [ ] All 12 service files created in services/ folder (flat, no subfolders)
- [ ] Each service file is independently valid docker-compose YAML
- [ ] Each service file has x-metadata extension field with structured metadata
- [ ] Database services are vendor+version specific (4 variants)
- [ ] README documents structure, schema, and usage
- [ ] No hardcoded secrets (all use env var substitution)

## Completion Checklist
- [ ] Code follows discovered patterns from reference compose files
- [ ] x-metadata schema is consistent across all service files
- [ ] Network definition is identical across all files
- [ ] Port mappings don't conflict for commonly-combined services
- [ ] Environment variables match conventions from reference files
- [ ] README is comprehensive enough for a new developer
- [ ] Self-contained — no questions needed during implementation

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Docker Compose warns on duplicate network definitions across includes | MEDIUM | LOW | Warnings are non-fatal; document this behavior |
| External tool may need specific metadata fields we haven't anticipated | LOW | MEDIUM | x-metadata schema is extensible; tool can add fields later |
| Docker Compose `include` version requirement (2.20+) not met | LOW | HIGH | Document minimum version in README |

## Notes
- The `x-metadata` extension field approach is chosen because it's native YAML, ignored by Docker Compose, and parseable by any YAML tool
- Each service file defines `networks: stack:` to be independently valid; Docker Compose may warn when multiple includes define the same network, but this is non-fatal
- The `category` field in metadata enables grouping in the tool's user prompt (e.g., "Select a database:", "Optional services:")
- `mutually_exclusive_with` in metadata helps the tool prevent conflicting selections (e.g., two different databases)
