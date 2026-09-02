---
# Allowed version bumps: patch, minor, major
"@jahia/cypress": patch
---

Fixed the `[BEGIN TEST]`/`[END TEST]` spec markers silently promoting the visitor's own session to root, which could leak an authenticated view into the very next command run on that session. (#253)
