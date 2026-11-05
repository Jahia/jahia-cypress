# Phased run

`jahia-cypress-run` runs the specs of a project in ordered phases against one Jahia. A serial phase is one `cypress run`. A parallel phase splits its specs over several `cypress run` processes that run side by side, which also puts the Jahia under concurrent users.

A spec can run in a parallel phase when it creates its own data (its own site, users and keys), does not change a server-wide setting, and waits only for its own publications (`publishAndWaitJobEnding`, or `waitAllJobsFinished` with a path).

## Use

Point the Cypress script of the project at the runner. Every option is passed to each `cypress run`, except `--spec`, which the phases replace:

```json
"e2e:ci": "jahia-cypress-run --browser chrome"
```

| Variable | Default | Role |
|---|---|---|
| `CYPRESS_WORKERS` | `1` | The width of a parallel phase that sets no `workers`. With 1, every phase runs as one `cypress run`. |
| `CYPRESS_PHASES_FILE` | `execution-phases.yml` | The phases file, relative to the project directory. |
| `CYPRESS_REPORTER_CONFIG` | `reporter-config.json` | The `cypress-multi-reporters` configuration the runner copies for each run. |

Each process of a parallel phase gets `CYPRESS_THREAD` (`Cypress.env('THREAD')`), its own `downloadsFolder`, `screenshotsFolder` and `videosFolder` (suffix `w<N>`). Each run gets its own copy of the reporter configuration, where the mochawesome `reportFilename` becomes `<name>-<phase>-w<N>`, so `mochawesome-merge results/reports/cypress*.json` still finds every report.

The runner needs Node 22 or later. It exits 0 when every run passed, 1 when one failed, and 2 when it could not start (a bad phases file, for example). Every phase runs, even after a failure.

## The phases file

```yaml
specs: cypress/e2e/**/*.ts          # optional, the default
exclude: cypress/e2e/**/*.ignore.ts # optional, the default
phases:
  - name: begin
    mode: serial
    specs: [cypress/e2e/**/*.spec.begin.ts]
  - name: serial
    mode: serial
    specs: [cypress/e2e/**/*.serial.cy.ts]
  - name: parallel
    mode: parallel
    workers: 2                       # optional, else CYPRESS_WORKERS
  - name: end
    mode: serial
    specs: [cypress/e2e/**/*.spec.end.ts]
```

- The phases run in the order of the file.
- A spec goes to the first phase whose globs match it.
- Exactly one phase has no `specs`. It takes every spec that no other phase matched.
- The order of the specs inside one `cypress run` is the one Cypress chooses. When two specs must run in a given order, put them in two phases.

Without a phases file, the runner uses the four phases above.
