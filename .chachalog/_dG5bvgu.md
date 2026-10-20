---
"@jahia/cypress": minor
---

Added a readiness check that stops a test run before Cypress starts when a module of the manifest is missing or not started. A Maven repository that could not serve a module now fails the run at once instead of spec by spec, and a provisioning call that fails stops the run too.
