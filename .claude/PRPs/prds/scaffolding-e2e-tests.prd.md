# Scaffolding E2E Tests & CI/CD Pipeline

## Problem Statement

Jahia platform maintainers who modify the jahia-cypress scaffolding have no automated way to verify that the scaffolding still produces a working Cypress test suite. Today, validating that `jahia-cli init` generates a functional project — both natively and via Docker container — requires manual effort, leading to undetected regressions.

## Evidence

- Manual testing is the only validation path for scaffolding changes today
- The jahia-cli PoC phase (`test-jahia-cli` branch) is actively evolving the scaffolding, increasing regression risk
- No existing CI workflow validates the scaffolding end-to-end (the `on-code-change.yml` only lints/builds the jahia-cypress library itself)

## Proposed Solution

Create an e2e test suite (in `scaffolding_tests/` directory) and a GitHub Actions workflow that validates the jahia-cypress scaffolding in two scenarios:

1. **Native test**: Run `jahia-cli init` in a fresh folder, accept defaults (with scaffolding version override), answer "yes" to run the sample workflow, and verify Cypress tests pass ("All specs passed!").
2. **Docker container test**: Using the generated config, create a Jahia environment, build the test Docker container, run tests inside it, collect artifacts, and verify `tests_success` file and `cypress.log` containing "All specs passed!".

## Key Hypothesis

We believe automated e2e scaffolding validation will catch regressions before merging for jahia-cypress maintainers.
We'll know we're right when PRs to jahia-cypress show both native and Docker test jobs passing in CI.

## What We're NOT Building

- Test coverage for jahia-cli itself — this validates the scaffolding, not the CLI tool
- Multi-platform testing — Ubuntu only, as specified
- Custom Jahia module testing — only the base scaffolding sample tests
- Publishing or deployment steps — this is purely validation

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Native test passes | "All specs passed!" in workflow output | grep stdout |
| Docker test passes | "All specs passed!" in workflow output | grep stdout |
| Artifacts collected | `tests_success` file + `cypress.log` with "All specs passed!" | file existence checks |
| CI reliability | Green pipeline on valid scaffolding | PR status checks |

## Open Questions

- [ ] When PoC is complete, switch scaffolding version from `test-jahia-cli` to `latest`
- [ ] Whether additional runner labels beyond `self-hosted` will be needed in production

---

## Users & Context

**Primary User**
- **Who**: Jahia platform maintainers working on jahia-cypress scaffolding
- **Current behavior**: Manually run `jahia-cli init` and test the generated project after changes
- **Trigger**: Any modification to scaffolding files (templates, Dockerfile, configs)
- **Success state**: CI pipeline automatically validates scaffolding on every PR

**Job to Be Done**
When I push changes to the jahia-cypress scaffolding, I want automated e2e validation, so I can catch regressions before merging.

**Non-Users**
External consumers of the published `@jahia/cypress` package — they benefit indirectly but don't interact with this pipeline.

---

## Solution Detail

### Core Capabilities (MoSCoW)

| Priority | Capability | Rationale |
|----------|------------|-----------|
| Must | Native scaffolding test (init + sample workflow) | Core validation that scaffolding generates working tests |
| Must | Docker container test (build + run + artifacts) | Validates the Docker-based CI flow that real projects use |
| Must | Artifact verification (tests_success + cypress.log) | Confirms test results are properly collected |
| Must | Configurable scaffolding version via workflow input | Enables PoC (`test-jahia-cli`) and future (`latest`) use |
| Must | Environment cleanup after tests | Prevents resource leaks on self-hosted runners |
| Should | Upload test artifacts to GitHub Actions | Debugging aid for failed runs |
| Won't | Multi-OS or multi-Node testing | Out of scope — Ubuntu + latest LTS only |

### MVP Scope

Two CI jobs in a single workflow:

1. **Job: native-scaffolding-test** — Validates `jahia-cli init` end-to-end
2. **Job: docker-container-test** — Validates the Docker-based test flow

Both must show "All specs passed!" to pass.

### User Flow

```
PR opened/updated → Workflow triggered
  → Job 1: Native test
    → Create fresh tests/ folder
    → Run jahia-cli init (pipe answers, scaffolding version = test-jahia-cli)
    → Answer "yes" to run sample workflow
    → Verify "All specs passed!" in output
  → Job 2: Docker container test
    → Use generated jahia-cli.config.yml
    → environment:create → tests:build → tests:run → tests:artifacts
    → Verify tests_success file + cypress.log contains "All specs passed!"
    → environment:delete (cleanup)
```

---

## Technical Approach

**Feasibility**: HIGH

**Architecture Notes**
- All jahia-cli commands exist and are well-structured (OCLIF-based TypeScript CLI)
- `init` uses inquirer prompts — automate via piped input (echo + pipe or expect-style)
- Scaffolding version is set during `init` prompt (not a CLI flag) — pipe `test-jahia-cli` at the version prompt
- State file (`~/.jahia-cli/state.json`) shared between `environment:create`, `tests:run`, `tests:artifacts`
- Self-hosted runners have Docker access (required for `environment:create` and `tests:build`)
- The `init` command's "Run sample workflow now? → yes" triggers: `tests:init → environment:create → alive → yarn install → yarn e2e:ci → environment:delete`

**Interactive Prompt Automation**
The `jahia-cli init` command asks these prompts in order with these defaults:
1. Configuration file name: `jahia-cli.config.yml` (accept default)
2. Directory to store configuration: `.` (accept default)
3. Environment name: `env-<random>` (accept default)
4. Jahia Docker image: `jahia/jahia-ee:8.2.1.0` (accept default)
5. Add SMTP server (Mailpit)?: `No` (accept default)
6. Tests scaffolding repository: `https://github.com/Jahia/jahia-cypress` (accept default)
7. Scaffolding path within repository: `scaffolding/` (accept default)
8. Scaffolding version: `latest` → **type `test-jahia-cli`** (override)
9. Run the sample workflow now?: `No` → **type `Y`** (override to yes)

**Technical Risks**

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Interactive prompt automation fragility | M | Test piped input approach; fallback to `--json` mode + separate workflow:run |
| Docker build timeouts on self-hosted | L | Set generous timeouts in workflow |
| State file not shared between jobs | L | Keep docker tests in single job; use consistent state path |
| jahia-cli version incompatibility | L | Pin to `@latest` or specific version in workflow |

---

## Implementation Phases

| # | Phase | Description | Status | Parallel | Depends | PRP Plan |
|---|-------|-------------|--------|----------|---------|----------|
| 1 | Workflow file creation | Create GitHub Actions workflow YAML with both test jobs | pending | - | - | - |
| 2 | Native test automation | Implement piped-input automation for `jahia-cli init` + sample workflow | pending | - | 1 | - |
| 3 | Docker test automation | Implement environment:create + tests:build + tests:run + tests:artifacts flow | pending | - | 1 | - |
| 4 | Artifact verification | Add verification steps (tests_success file, cypress.log content) | pending | - | 2, 3 | - |
| 5 | Cleanup & upload | Add environment cleanup and GitHub artifact upload steps | pending | - | 4 | - |

### Phase Details

**Phase 1: Workflow file creation**
- **Goal**: Create `.github/workflows/scaffolding-tests.yml` with basic structure
- **Scope**: Workflow triggers (PR + manual dispatch), runner config (`self-hosted`), Node setup, scaffolding version input
- **Success signal**: Workflow file passes YAML validation

**Phase 2: Native test automation**
- **Goal**: Automate `jahia-cli init` with piped answers + run sample workflow
- **Scope**: Create tests dir, pipe correct answers (defaults + scaffolding version override + "yes" to run workflow), verify "All specs passed!" in output
- **Success signal**: Job exits 0 with "All specs passed!" in logs

**Phase 3: Docker test automation**
- **Goal**: Build and run tests via Docker container flow
- **Scope**: `environment:create`, `tests:build --context .`, `tests:run --env JAHIA_HOST=jahia --env JAHIA_URL=http://jahia:8080`, `tests:artifacts -o ./results/`
- **Success signal**: Tests pass inside container, artifacts collected

**Phase 4: Artifact verification**
- **Goal**: Verify test results meet success criteria
- **Scope**: Check `results/tests_success` exists, check `results/cypress.log` contains "All specs passed!"
- **Success signal**: Verification steps pass

**Phase 5: Cleanup & upload**
- **Goal**: Clean up Docker environment and upload artifacts
- **Scope**: `environment:delete`, `actions/upload-artifact@v4`
- **Success signal**: No orphaned containers, artifacts visible in GitHub Actions

### Parallelism Notes

Phases 2 and 3 can be developed in parallel (they're separate jobs in the workflow), but both depend on Phase 1 (the base workflow structure). Phase 4 depends on both being complete. Phase 5 is final cleanup.

---

## Decisions Log

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| Runner | `self-hosted` only | `ubuntu-latest` | Docker access required; user specified self-hosted |
| Scaffolding version | Hardcoded `test-jahia-cli` | Workflow input parameter | User chose hardcoded for PoC simplicity |
| Prompt automation | Piped stdin | `--json` mode + separate commands | More faithful to user experience; tests the interactive flow |
| Workflow trigger | PR + manual dispatch | PR only, push only | Maximum flexibility during PoC |
| Test directory | `scaffolding_tests/` | `tests/` | Avoids conflict with existing `tests/` directory |
| Node version | `lts/*` | Specific version | Matches existing workflows; user specified latest LTS |

---

## Research Summary

**Market Context**
- jahia-cli is an OCLIF-based TypeScript CLI providing scaffolding, environment management, and test orchestration for Jahia Cypress projects
- The `init` command is the primary entry point, generating a complete project from the jahia-cypress scaffolding
- No existing CI validates the scaffolding itself — only the library build/lint

**Technical Context**
- All required commands exist: `init`, `environment:create`, `tests:build`, `tests:run`, `tests:artifacts`
- Scaffolding version is config-driven (`tests.scaffolding.version` in YAML), set during `init` prompts
- State file at `~/.jahia-cli/state.json` is the glue between environment and test commands
- The sample workflow triggered by "Run now? → yes" runs the full lifecycle: init → create → alive → install → test → delete
- Docker container test flow requires the environment to be running (network connectivity via Docker network)

---

*Generated: 2026-05-17T20:25+02:00*
*Status: DRAFT - needs validation*
