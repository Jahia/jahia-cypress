---
# Allowed version bumps: patch, minor, major
"@jahia/cypress": patch
---

A `describe.since()` suite skipped on an unsupported Jahia version no longer runs its `before()` and `after()` hooks, so its setup and teardown no longer fail on that version.
