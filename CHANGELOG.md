# @jahia/cypress Changelog

## 8.2.1

* Temporary remove bash injections which can be treated by antivirus as a potentially unsafe. They will be reworked and brought back later on. (#224)

## 8.2.0

* Add `context.tag()` function for adding tags (user-defined labels) that can be attached to test suites and individual tests to provide metadata about test characteristics, scope, and purpose (#221)

## 8.1.1

* Use default Jahia ref. while fetching version; fail safe when version can't be fetched.

## 8.1.0

### New Features

* Add `it.since()` and `describe.since()` modifiers to gate tests by Jahia version (#216)

* Add jfaker library for generating test strings containing human-readable or injections data (#202)

* Improve cypress logs of script execution, now groovy / provisioning and graphql calls provides more information (#214)

### Bug Fixes

* Add browser helpers for printing out auxiliary information about cookies and storages for debugging purposes (#215)

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
