---
# Allowed version bumps: patch, minor, major
"@jahia/cypress": patch
---

Fixed tags set with `context.tag()` in a `describe()` so they reach the tests of every nested `describe()`, not only the first one.
