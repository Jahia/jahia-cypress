# @jahia/cypress Changelog

## 8.1.0

* Add jfaker library for generating test strings containing human-readable or injections data (#202)

## 8.0.0

### Breaking Changes

* Bump "typescript" from 4.3.5 to 5.9.3; update dependencies accordingly; (#203)

### New Features

* Add copyNode helper (#196)

* Leverage Buildx cache when building Docker test image (#191)

  Use Docker Buildx with the GitHub Actions Cache (if enabled with `DOCKER_BUILD_CACHE_ENABLED` env variable), to speed up the build of the Docker test image (done with `ci.build.sh`)

### Bug Fixes

* Fix broken copyNode helper

  CopyNode (#198)
