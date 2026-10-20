# Provisioning readiness check

## Overview

`env.run.sh` provisions the platform from the manifest, then starts Cypress. The provisioning API
answers 200 whatever happened to each operation: when the Maven repository cannot serve a module,
Jahia logs `Cannot install` and the suite runs on a platform that misses the module. The failures
then surface half an hour later, spec by spec, far from their cause.

`env.readiness.sh` runs between the two. It lists the modules the manifest installs, reads the state
of every bundle from the module manager API of the processing node, and exits with a non-zero code
when a module is missing or not started. `env.run.sh` then stops before Cypress starts, writes
`results/test_failure` as it does for a failed suite, and exits 1.

`env.run.sh` also stops when `env.provision.sh` fails, which it used to ignore, and
`env.provision.sh` now fails on a transport error of the provisioning call or on a status the API
answers when it could not run the script at all. The answer of the API is kept in
`run-artifacts/provisioning-response.json`.

## What is checked

- Every `mvn:` and `js:mvn:` URL under `installBundle`, `installModule`, `installAndStartBundle`,
  `installAndStartModule`, `installOrUpgradeBundle` and `installOrUpgradeModule`, written as a string
  or as a `url:` entry. The module id is the artifactId of the URL.
- The state each operation leaves the module in, as Jahia applies it: `installAndStart*` leaves it
  STARTED, `installOrUpgrade*` leaves it STARTED unless the entry says `autoStart: false`, and
  `installBundle` and `installModule` leave it STARTED only when the entry says `autoStart: true`,
  installed otherwise.
- A module in a transient state (STARTING, WAITING_TO_BE_IMPORTED, SPRING_STARTING) is read again
  every 5 seconds, up to `PROVISIONING_CHECK_TIMEOUT` seconds.

An entry with an `if` condition is left out, since Jahia decides it. So is a local file, whose name
does not give the module id, and the manifests an `include:` names, which the check does not read.
The modules a project submits from its `artifacts/` folder are covered by the check of `MODULE_ID`
that `env.run.sh` already makes.

## Configuration

| Variable | Default | Role |
|---|---|---|
| `PROVISIONING_CHECK` | `true` | `false` skips the check. |
| `PROVISIONING_CHECK_IGNORE` | | The module ids the check leaves out, separated by commas, for a module whose id is not the artifactId of its URL. |
| `PROVISIONING_CHECK_TIMEOUT` | `60` | The seconds the check waits for a module in a transient state. |

The variables are read from the environment of the Cypress container, so a `docker-compose` file
sets them under `environment:`, next to `MANIFEST`.

## Reading the log

Every line of the check starts with `[READINESS]`. A failed check prints one `MISSING` line per
module, with the state the manifest asks for and the states the platform reports, then
`PLATFORM NOT READY - EXITING SCRIPT, NOT RUNNING THE TESTS`. The cause is in the `ERROR` lines of
`jahia.log`, such as `Cannot install mvn:org.jahia.modules/sitemap`.
