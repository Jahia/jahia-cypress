---
"@jahia/cypress": minor
---

Improved the readiness check so it also checks the modules of included manifests, and stops the run when one is missing. A suite that is green today can turn red at startup when a module of an included manifest already failed to install.
