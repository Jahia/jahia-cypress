---
# Allowed version bumps: patch, minor, major
jahia-cypress: minor
---

Leverage Buildx cache when building Docker test image (#191)

Use Docker Buildx with the GitHub Actions Cache (if enabled with `DOCKER_BUILD_CACHE_ENABLED` env variable), to speed up the build of the Docker test image (done with `ci.build.sh`)
