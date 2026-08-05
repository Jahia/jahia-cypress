# Modular Docker Compose Service Library

## Problem Statement

Jahia developers, QA engineers, and CI/CD pipelines need to spin up test environments with varying combinations of services (databases, search engines, SMTP, clustering). Today, each project maintains its own full docker-compose file with duplicated, diverging service definitions — leading to maintenance burden, drift between projects, and onboarding friction.

## Evidence

- `Jahia/user-password-authentication` defines its own Jahia + SMTP compose stack
- `Jahia/jahia-ee` defines its own Jahia + PostgreSQL + cluster compose stack
- `Jahia/augmented-search` defines its own Jahia + MariaDB + Elasticsearch + Kibana + HAProxy + cluster compose stack
- All three share overlapping service definitions with inconsistent configuration patterns

## Proposed Solution

A centralized library of composable docker-compose service files in `scaffolding/environment/services/`, each self-contained and including `x-metadata` extension fields. An external tool reads these metadata fields to prompt the user about desired services, then assembles a master `docker-compose.yml` using Docker Compose's native `include` directive. The master file is a documented placeholder containing only shared infrastructure (networks).

## Key Hypothesis

We believe a modular, metadata-enriched service catalog will reduce environment setup time and eliminate service definition drift for developers, QA, and CI/CD pipelines.
We'll know we're right when new projects can define their test environment by selecting services rather than copying compose files.

## What We're NOT Building

- The composition tool/script itself — that's a separate tool outside this codebase
- Runtime orchestration or health-check logic beyond Docker's built-in capabilities
- Production deployment configurations — this is for dev/test only
- Service discovery or dynamic scaling

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Service reuse | 80%+ of Jahia test projects use the catalog | Adoption count |
| Setup time | < 5 minutes from service selection to running stack | Manual timing |
| Definition drift | Zero diverging copies of same service | Code audit |

## Open Questions

- [ ] Should the external tool support service "profiles" (predefined bundles)?
- [ ] Should services declare required environment variables vs optional ones in metadata?
- [ ] What naming convention for database version variants (e.g., `mariadb-10.yml` vs `database-mariadb-10.yml`)?
- [ ] Should browsing nodes support a configurable count, or remain fixed definitions?

---

## Users & Context

**Primary User**
- **Who**: Jahia module developers, QA engineers, CI/CD pipeline maintainers
- **Current behavior**: Copy a docker-compose.yml from another project, modify it for their needs, keep maintaining it independently
- **Trigger**: Starting a new module's test infrastructure or updating an existing environment
- **Success state**: Select services from catalog → get a working, consistent environment

**Job to Be Done**
When setting up a test environment for a Jahia module, I want to compose services from a shared catalog, so I can get a consistent, working stack without copy-pasting and maintaining divergent definitions.

**Non-Users**
Production ops teams — this is explicitly dev/test tooling.

---

## Solution Detail

### Core Capabilities (MoSCoW)

| Priority | Capability | Rationale |
|----------|------------|-----------|
| Must | Master docker-compose.yml with shared networks | Foundation all services attach to |
| Must | Jahia processing node service | Every environment needs at least one |
| Must | Database services (PostgreSQL 16/17/18, MariaDB 10) | Jahia requires a database |
| Must | x-metadata in each service file for tooling | External tool needs structured info |
| Must | Docker Compose `include` compatibility | Standard composition mechanism |
| Should | Cypress test runner service | Most test environments need it |
| Should | Elasticsearch service | Required for augmented-search and similar |
| Should | SMTP/Mailpit service | Required for email-related testing |
| Should | Jahia browsing node service | Required for cluster testing |
| Could | Kibana service | Useful for ES debugging |
| Could | HAProxy service | Useful for cluster load balancing |
| Won't | Composition script/tool | Separate codebase, not in scope |

### MVP Scope

- Master `docker-compose.yml` (networks only, documented)
- `services/` folder with individual compose files
- Each service file uses `x-metadata` for tool integration
- Minimum viable set: Jahia processing, databases (4 variants), Cypress, Elasticsearch, Mailpit, Jahia browsing, Kibana, HAProxy

### User Flow

1. Developer runs external composition tool
2. Tool reads `services/*.yml`, parses `x-metadata` from each
3. Tool prompts user: "Which services do you need?" (using metadata descriptions/categories)
4. Tool generates master `docker-compose.yml` with appropriate `include` directives
5. Developer runs `docker compose up`

---

## Technical Approach

**Feasibility**: HIGH

**Architecture Notes**
- Uses Docker Compose `include` feature (docs.docker.com/compose/how-tos/multiple-compose-files/include/)
- Each service file is a valid standalone compose file with its own `services:` key
- All services attach to the `stack` network defined in the master file
- `x-metadata` YAML extension fields are natively ignored by Docker Compose but parseable by tooling
- Database services are split by vendor AND version (flat files, no subfolders)
- Environment variables use `${VAR}` substitution for flexibility

**Technical Risks**

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `include` feature requires Compose v2.20+ | LOW | Document minimum version requirement |
| Network name conflicts across includes | LOW | Single shared network defined in master |
| Port conflicts between services | MEDIUM | Document default ports, allow override via env vars |

---

## Implementation Phases

| # | Phase | Description | Status | Parallel | Depends | PRP Plan |
|---|-------|-------------|--------|----------|---------|----------|
| 1 | Foundation | Create master docker-compose.yml and services/ directory structure | complete | - | - | .claude/PRPs/plans/completed/modular-docker-compose-services.plan.md |
| 2 | Core services | Create Jahia processing, database variants, Cypress | complete | with 3 | 1 | .claude/PRPs/plans/completed/modular-docker-compose-services.plan.md |
| 3 | Extended services | Create Elasticsearch, Mailpit, Kibana, HAProxy, Jahia browsing | complete | with 2 | 1 | .claude/PRPs/plans/completed/modular-docker-compose-services.plan.md |
| 4 | Documentation | README documenting the library, metadata schema, and usage | complete | - | 2, 3 | .claude/PRPs/plans/completed/modular-docker-compose-services.plan.md |

### Phase Details

**Phase 1: Foundation**
- **Goal**: Establish the master compose file and directory structure
- **Scope**: `environment/docker-compose.yml` with networks, `environment/services/` directory
- **Success signal**: `docker compose config` validates the master file

**Phase 2: Core services**
- **Goal**: Create the minimum services every Jahia project needs
- **Scope**: `jahia.yml`, `postgres-16.yml`, `postgres-17.yml`, `postgres-18.yml`, `mariadb-10.yml`, `cypress.yml`
- **Success signal**: Each file passes `docker compose -f <file> config`

**Phase 3: Extended services**
- **Goal**: Create optional services for specific use cases
- **Scope**: `elasticsearch.yml`, `mailpit.yml`, `kibana.yml`, `haproxy.yml`, `jahia-browsing.yml`
- **Success signal**: Each file passes `docker compose -f <file> config`

**Phase 4: Documentation**
- **Goal**: Document the library for developers and tool authors
- **Scope**: README.md explaining structure, metadata schema, how to add services
- **Success signal**: A new developer can understand and use the library from docs alone

### Parallelism Notes

Phases 2 and 3 can run in parallel (both depend only on Phase 1). Phase 4 depends on both being complete.

---

## Decisions Log

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| Metadata format | `x-metadata` YAML extension | Comments, sidecar files | Native YAML, ignored by Docker, parseable by tools |
| Directory structure | Flat `services/` folder | Subfolders by category | Simpler, user requested single folder |
| Database naming | `{vendor}-{version}.yml` | Generic `database.yml` | Need version-specific configs |
| Network strategy | Shared `stack` network in master | Per-service networks | Simplicity, matches existing pattern |
| Composition mechanism | Docker Compose `include` | Manual merge, override files | Official Docker recommendation |

---

## Research Summary

**Market Context**
Docker Compose `include` (v2.20+) is the standard mechanism for modular composition. It allows each included file to be a valid standalone compose file while contributing services to the parent.

**Technical Context**
All three reference compose files from Jahia repos share consistent patterns:
- `stack` network for inter-service communication
- Environment variable substitution for images and credentials
- Container naming matching service names
- Port mappings following predictable patterns (8080 for Jahia, DB defaults, etc.)

---

*Generated: 2026-05-20T12:50:00*
*Status: DRAFT - needs validation*
