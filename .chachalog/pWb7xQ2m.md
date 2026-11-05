---
# Allowed version bumps: patch, minor, major
"@jahia/cypress": minor
---

`publishAndWaitJobEnding` waits only for the publication jobs of the node it published, and `waitAllJobsFinished` takes an optional path to do the same, so specs running side by side no longer wait for each other's publications
