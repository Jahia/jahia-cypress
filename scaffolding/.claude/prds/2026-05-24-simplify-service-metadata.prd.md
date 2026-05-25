# Service Metadata Simplification

## Problem
Developers maintaining the environment service definitions face avoidable complexity in metadata used for initialization. The current model introduces relationship-oriented metadata that is overkill for a one-time init flow and increases maintenance overhead. If left unchanged, this complexity raises the cost of updating the service catalog and slows adoption of the environment setup flow.

## Evidence
- Assumption — needs validation via developer interviews and maintenance-time tracking

## Users
- **Primary**: Developers maintaining the scaffolding/environment service definitions, typically when adding or updating available service containers for initialization flows.
- **Not for**: End users running the already-generated environment; this is not a runtime operations feature.

## Hypothesis
We believe **simplifying service metadata to a minimal base-vs-optional model** will **improve maintainability and reduce setup-model complexity** for **developers maintaining the init scaffolding**.
We'll know we're right when **maintainers report lower cognitive load and reduced effort/time for service catalog updates**.

## Success Metrics
| Metric | Target | How measured |
|---|---|---|
| Maintainer effort to update service catalog | TBD — needs validation via baseline + follow-up measurement | Compare median time-to-complete representative metadata updates before vs after change |
| Perceived metadata complexity | TBD — needs validation via maintainer feedback survey | Short post-change maintainer survey on clarity and confidence |

## Scope
**MVP** — Replace relationship-heavy service metadata with a minimal model that distinguishes always-started base services from optionally addable containers, and support user choice for optional containers in init flow.

**Out of scope**
- Runtime orchestration enhancements beyond init-time service selection — deferred to keep this change focused on simplification
- New dependency/relationship modeling in metadata — explicitly excluded to prevent reintroducing complexity

## Delivery Milestones
<!-- Business outcomes, not engineering tasks. /plan turns each into a plan. -->
<!-- Status: pending | in-progress | complete -->

| # | Milestone | Outcome | Status | Plan |
|---|---|---|---|---|
| 1 | Simplified metadata model adopted | Maintainers can classify services as always-started or optional without relationship modeling overhead | complete | .claude/PRPs/reports/simplify-service-metadata-plan-report.md |
| 2 | Init selection experience aligned | Init flow presents optional containers clearly and consistently, while base services are always included | complete | .claude/PRPs/reports/simplify-service-metadata-plan-report.md |

## Open Questions
- [ ] No open questions identified currently; validate metric baselines during planning.

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Success criteria remain subjective without baseline data | Medium | Medium | Define measurable baselines during planning and validate with maintainers |
| Simplification removes useful structure needed by future scenarios | Low | Medium | Keep scope bounded to current init use-case and revisit only with validated new requirements |

---
*Status: IMPLEMENTED — see report for execution and validation details.*
