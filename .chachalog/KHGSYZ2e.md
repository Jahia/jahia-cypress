---
# Allowed version bumps: patch, minor, major
"@jahia/cypress": minor
---

`jahia-cypress-run` runs the specs in ordered phases against one Jahia, the specs a parallel phase holds split over several `cypress run` processes side by side, from an `execution-phases.yml` file or from the file names (`*.spec.begin.ts`, `*.serial.cy.ts`, `*.spec.end.ts`)
