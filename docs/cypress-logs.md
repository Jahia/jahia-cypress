# Terminal/Files Logs Reporter (cypress-terminal-report integration)

## Overview

[cypress-terminal-report](https://github.com/archfz/cypress-terminal-report) collects Cypress
command/console logs and writes them to files (and/or prints them to the terminal) so failures can
be diagnosed from CI logs without re-running a headed browser. Historically, every consumer repo
(e.g. `jahia-ee/docker-tests`, etc.) copy-pasted its own setup for this into their `cypress/plugins/index.js` and
`cypress/support/e2e.js`. `src/support/terminalReport.ts` centralizes that setup in `@jahia/cypress`
so consumers just call a function instead of maintaining the configuration themselves.

## Architecture: two processes, two halves

cypress-terminal-report is split into two independent pieces that run in **two different OS
processes**, and this shows up directly in how this module is structured:

| | Collector | Printer |
|---|---|---|
| Runs in | Browser / spec-runner process | Node.js plugin process |
| Installed by | `installLogsCollector` (cypress-terminal-report) | `installLogsPrinter` (cypress-terminal-report) |
| Wrapped by | `registerLogsCollector` | `registerLogsPrinter` |
| Called from | `registerSupport()` (`support/e2e.js`) | Explicitly, in `setupNodeEvents(on, config)` (`plugins/index.js`) |
| Job | Gathers cy commands, console logs, etc. during a test | Writes/prints the collected logs once a run finishes |
| Talks via | `cy.task('ctrLogMessages'/'ctrLogFiles', ...)` | Registers those same task names via `on('task', {...})` |

**Why the printer is registered explicitly, not auto-wired into `registerPlugins`:** `registerPlugins`
is called by every consumer repo today, most of which don't use file-based log printing. Auto-wiring
the printer into it would silently turn on log-file writing for every repo the moment they upgraded
`@jahia/cypress` — an implicit behavior change with no opt-out that nobody asked for. Requiring an
explicit `registerLogsPrinter(on, config)` call keeps `registerPlugins` (and its diff) untouched and
makes the log-printing behavior opt-in and visible at the call site.

**Why the collector doesn't need the same explicit call:** unlike the printer, the collector is
*derived* from whether the printer is enabled (see "Why the collector self-detects" below) — so
`registerSupport()` can stay a plain, unconditional call with no new required argument.

## Why the collector self-detects instead of taking its own on/off flag

The critical constraint: **the collector must never run without the printer.** The collector calls
`cy.task('ctrLogMessages', ...)` after each command; that task handler is only registered by
`installLogsPrinter`. If the collector runs and the printer wasn't installed, `cy.task()` fails with
"no task was registered by that name" — which fails the Cypress command chain and **breaks every
test**, not just silently no-ops.

An earlier iteration of this module gave the collector its own independent on/off switch
(`registerSupport({logsCollector: true | false | options})`). That's fragile: it requires consumers
to keep two switches (printer enabled in the plugins file, collector enabled in the support file) in
sync by hand, in two different files, with no compiler or runtime check tying them together. Get it
wrong in one direction (`printer: on, collector: off`) and logging silently doesn't happen; get it
wrong in the other (`printer: off, collector: on`) and every test breaks.

**Solution:** `registerLogsPrinter` marks itself as enabled, and `registerLogsCollector` checks that
marker instead of taking its own explicit flag. This makes the two impossible to get out of sync —
there is exactly one switch (whether `registerLogsPrinter` was called), not two.

### How the marker crosses the process boundary

The plugin process (where `registerLogsPrinter` runs) and the browser process (where
`registerLogsCollector` runs) don't share memory — there is no `Cypress` global in the Node process,
and no `config` object in the browser. The only channel between them is Cypress's own config
resolution: whatever a plugins file's `setupNodeEvents(on, config)` mutates on `config.env` and
returns becomes readable in the browser via `Cypress.env(key)`. This is the same mechanism
`registerPlugins`'s `env.ts` already uses for `config.env.JAHIA_URL`, etc.

- `enableLogsPrinter(config)` — __Node/plugins side.__ Sets `config.env.JAHIA_HOOKS_TERMINAL_LOGGER_ENABLED = true`.
   Called from `registerLogsPrinter`.
- `isLogsPrinterEnabled()` — __browser/support side.__ Reads `Cypress.env('JAHIA_HOOKS_TERMINAL_LOGGER_ENABLED')`.
   Called from `registerLogsCollector`, which no-ops if this is falsy.

This works reliably because of Cypress's own lifecycle ordering: `setupNodeEvents` (Node process)
always runs once at startup, before the browser launches; `registerSupport()` (browser process) then
runs once per spec file, before that spec's tests. So by the time any collector code executes, the
printer (if enabled) has already set the flag — there's no race condition to guard against.

## Printer and Collector location

`logsPrinter` and  `logsCollector` are two separate files (`src/plugins/logsPrinter.ts` and `src/support/logsCollector.ts`) to mirror `server` vs `client` logic and avoid confusion while calling server-side function from the file, located in client-side folder.

## Usage

Enabling logging is a single call in the plugins file — nothing needs to change in the support file:

```js
// plugins/index.js
setupNodeEvents(on, config) {
    require('@jahia/cypress/dist/plugins/registerPlugins').registerPlugins(on, config);
    require('@jahia/cypress/dist/plugins/logsPrinter').registerLogsPrinter(on, config);
    return config;
}
```

```js
// support/e2e.js — unchanged; the collector activates automatically once the printer is enabled
require('@jahia/cypress/dist/support/registerSupport').registerSupport();
```

If `registerLogsPrinter` is never called, `registerSupport()` remains a no-op for logging — nothing
to enable, nothing that can break.
**Keep in mind:** if there is existing setup for the `cypress-terminal-report` in your repo - it might need to be cleaned up along with removing `cypress-terminal-report` from `package.json`

### Overriding options

```js
// Printer: override any cypress-terminal-report PluginOptions
registerLogsPrinter(on, config, {printLogsToFile: 'onFail'});

// Collector: override any cypress-terminal-report SupportOptions, via registerSupport
registerSupport({logsCollector: {collectTypes: ['cy:command', 'cy:xhr']}});
```

## API Reference

| Export | Where called from | Description |
|---|---|---|
| `registerLogsPrinter(on, config, options?)` | Plugins file, `setupNodeEvents` | Installs the printer with Jahia's defaults (txt logs under `results/logs/`, console output on failure only); marks the printer as enabled. |
| `registerLogsCollector(options?)` | Automatically, from `registerSupport` | Installs the collector with Jahia's defaults, but only if `registerLogsPrinter` was called — otherwise a no-op. |

### Defaults

**Printer** (`registerLogsPrinter`):

- `outputRoot`: `<projectRoot>/results/logs/`
- `specRoot`: `cypress/e2e`
- `outputTarget`: `{'.|log': 'txt'}`
- `printLogsToConsole`: `'onFail'`
- `printLogsToFile`: `'always'`
- `includeSuccessfulHookLogs`: `true`

**Collector** (`registerLogsCollector`):

- `enableExtendedCollector`: `true`
- `collectTypes`: `['cons:log', 'cons:info', 'cons:error', 'cy:log', 'cy:xhr', 'cy:fetch', 'cy:request', 'cy:intercept', 'cy:command']`