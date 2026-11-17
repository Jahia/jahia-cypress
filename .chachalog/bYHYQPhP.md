---
# Allowed version bumps: patch, minor, major
"@jahia/cypress": minor
---

Added `addPageWithArea` to create a page with an area that holds some content, so a test can render the page without building the area itself. By default the area is `area-main` and holds one text node. The caller can name another area, pass content of any node type and set the language.
