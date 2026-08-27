---
# Allowed version bumps: patch, minor, major
"@jahia/cypress": minor
---

Added `addPage` to create a page from a test, so each project no longer needs its own copy. It sets the page template and title, and leaves the page content to the caller: areas, content nodes and extra languages are passed in. (#NNN)
