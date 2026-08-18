---
# Allowed version bumps: patch, minor, major
"@jahia/cypress": patch
---

Fixed CI startup so it fails immediately when an image cannot be pulled, instead of hanging until the job times out. The job log now shows the registry error instead of an unanswered confirmation prompt. (#243)
