---
# Allowed version bumps: patch, minor, major
"@jahia/cypress": patch
---

Fixed the spec/test log markers so they can no longer promote the visitor's own session to root and leak an authenticated view into the command that runs right after. (#253)
