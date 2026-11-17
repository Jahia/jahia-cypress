---
# Allowed version bumps: patch, minor, major
"@jahia/cypress": patch
---

`registerSupport()` logs out the Jahia session that a test leaves behind, so a suite with many `cy.login()` calls no longer reaches the limit of logged-in users of the Jahia license. Set `JAHIA_LOGOUT_AFTER_TEST` to `false` to turn the hook off.
