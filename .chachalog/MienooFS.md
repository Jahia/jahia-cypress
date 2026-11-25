---
# Allowed version bumps: patch, minor, major
"@jahia/cypress": minor
---

`addPage` accepts `children` as a function of the page name and language. Added `pageContent()`, which gives the common page structure, `area-main` with one text node, in the page language. Its value defaults to the page name, and its node type to `jnt:text`.
