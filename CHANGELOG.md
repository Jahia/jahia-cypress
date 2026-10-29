# @jahia/cypress Changelog

## 8.9.0

* Configure mail-service in the SMTP setup script on every Jahia version whose core ships the `org.jahia.api.mail` API, which includes 8.2.3.8 and later 8.2.3.x releases

## 8.8.0

### New Features

* Added a readiness check that stops a test run before Cypress starts when a module of the manifest is missing or not started. A Maven repository that could not serve a module now fails the run at once instead of spec by spec, and a provisioning call that fails stops the run too. A suite whose module under test is not installed also stops now, which the previous check could never detect, so a suite green today can turn red at startup when its provisioning was already failing. A repository whose tests target no module, such as the Jahia core, sets `MODULE_ID_CHECK=false`.

### Bug Fixes

* A `describe.since()` suite skipped on an unsupported Jahia version no longer runs its `before()` and `after()` hooks, so its setup and teardown no longer fail on that version.

* The test start and end markers written to the Jahia log no longer fail for a test or spec name that contains a double quote, a dollar sign or a backslash.

## 8.7.0

* Added `startModule` and `stopModule` to start or stop a module and wait until it is active or stopped, on any Jahia version.

* `it.since()` and `describe.since()` now accept version ranges such as `'<8.2.4'`, and a plain version still means that version or later.

## 8.6.1

* Set the default mail recipient in the SMTP setup script on Jahia 8.2.4.0 and later, so a mail Jahia sends without a recipient reaches Mailpit (#260)

## 8.6.0

* Added `breakAclInheritance` and `restoreAclInheritance` helpers to stop or restore the inheritance of roles on a node.

* Added `createRole` and `deleteRole` to manage a role from a test through GraphQL, so each project no longer needs its own Groovy script.

## 8.5.0

### New Features

* Add cypress-mailpit support for tests (#247)

* Added an optional startup provisioning script that configures Jahia's SMTP settings for a Mailpit test server when `SMTP_SERVER_URL` is set, and does nothing otherwise.

* Generic `getGlobalVar`/`setGlobalVar` key/value store for sharing state (string | number | boolean) across all specs in a Cypress run, backed by `cy.task()`.

### Bug Fixes

* Fixed the spec/test log markers so they can no longer promote the visitor's own session to root and leak an authenticated view into the command that runs right after. (#253)

* Fixed intermittent test failures when reading a fixture that the project does not provide. These reads now use the project's `defaultCommandTimeout` instead of a shorter fixed timeout, so a loaded machine no longer fails the test. (#242)

## 8.4.0

* Added `addPage` to create a page from a test, so each project no longer needs its own copy. It sets the page template and title, and leaves the page content to the caller: areas, content nodes and extra languages are passed in. (#245)

## 8.3.1

* Fixed CI startup so it fails immediately when an image cannot be pulled, instead of hanging until the job times out. The job log now shows the registry error instead of an unanswered confirmation prompt. (#243)

## 8.3.0

### New Features

* Add specs and tests marks to jahia log (#234)

### Bug Fixes

* Update UserHelpers: unify interfaces and internal variables; add logging; extend createUser with site-level operation (#228)

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
