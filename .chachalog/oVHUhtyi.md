---
# Allowed version bumps: patch, minor, major
"@jahia/cypress": patch
---

Fixed intermittent test failures when reading a fixture that the project does not provide. These reads now use the project's `defaultCommandTimeout` instead of a shorter fixed timeout, so a loaded machine no longer fails the test. (#242)
