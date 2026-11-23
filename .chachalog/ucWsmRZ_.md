---
# Allowed version bumps: patch, minor, major
"@jahia/cypress": minor
---

Fixed long suites that reached the limit of logged-in users of the Jahia license.
`registerSupport()` now logs out the session that a test leaves behind, and keeps each session that `cy.session()` stores until the spec ends. Set `JAHIA_LOGOUT_AFTER_TEST` to `false` to turn this off.
