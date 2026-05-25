# Simplify environment service metadata plan

## Problem
The current service metadata model is relationship-heavy (`group`, `requires`, `config.yml`) and too complex for the intended one-time environment initialization flow. We need a minimal model where base services are always included and additional service containers are opt-in.

## Confirmed decisions
- Optional flag key: `x-metadata.optional`
- Always-included services in master compose: `jahia.yml`, `postgres.yml`
- Apply simplification to all service files under `environment/services`
- Keep only these metadata fields (besides optional flag): `name`, `description`
- Remove `group`, `requires`, and delete `environment/services/config.yml`

## Current state summary
- `environment/docker-compose.yml` already includes `jahia.yml` and `postgres.yml`.
- All service files currently still use `group` and `requires`.
- `environment/services/config.yml` still exists and is documented in `environment/README.md`.
- README still describes group/dependency model and config-driven selection.

## Implementation approach
1. Define a minimal metadata contract:
   - Base services: no `optional` flag (implicitly always included in master compose)
   - Optional services: `x-metadata.optional: true`
   - No relationship metadata.
2. Update all service YAML files to the new metadata shape.
3. Remove the obsolete `config.yml`.
4. Rewrite environment documentation to reflect the simpler model and selection behavior.
5. Validate compose resolution using the updated master include and fragments.

## Todos
1. **Define simplified x-metadata contract in docs**
   - Update `environment/README.md` schema and flow sections.
   - Remove references to groups, `requires`, and `config.yml`.
   - Document `optional: true` semantics for user-selectable containers.

2. **Migrate service metadata in all service fragments**
   - For base services (`jahia.yml`, `postgres.yml`): keep `name`, `description`; remove `group`/`requires`; do not set `optional`.
   - For all other service files in `environment/services/*.yml` (excluding `config.yml`): remove `group`/`requires`; add `optional: true` under `x-metadata`.
   - Keep service runtime definitions (`services:` blocks) unchanged unless required for consistency.

3. **Remove legacy group configuration**
   - Delete `environment/services/config.yml`.
   - Ensure no remaining references in docs/examples.

4. **Align master compose and examples**
   - Keep `environment/docker-compose.yml` include section explicitly containing `jahia.yml` and `postgres.yml`.
   - Update README examples to show base include + optional additions.

5. **Validation**
   - Validate no service files retain `group`/`requires`.
   - Validate docs mention `optional` model and no longer mention `config.yml`.
   - Run compose config validation for representative include set.

## Notes / considerations
- The optional model intentionally removes dependency orchestration from metadata; `jahia-cli` owns prompting/selection behavior.
- This change is intentionally breaking at metadata-contract level and is timed before broader adoption.
