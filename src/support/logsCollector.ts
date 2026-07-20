import installLogsCollector from 'cypress-terminal-report/src/installLogsCollector';
import type {SupportOptions} from 'cypress-terminal-report/src/installLogsCollector.types';

/**
 * Jahia's default cypress-terminal-report setup (https://github.com/archfz/cypress-terminal-report).
 *
 * cypress-terminal-report has two independent halves that run in two different processes, and
 * BOTH must be enabled together or neither should be:
 * - The collector (browser/spec-runner side) gathers cy commands, console logs, etc., and sends
 *   them to the Node process via `cy.task('ctrLogMessages'/'ctrLogFiles', ...)`.
 * - The printer (Node plugin process) registers the `ctrLogMessages`/`ctrLogFiles` task handlers
 *   and writes the collected logs to files (and/or prints them to the terminal) once a run finishes.
 *
 * If the collector runs without the printer registering those tasks, `cy.task()` fails with
 * "no task registered" and breaks every test. Rather than requiring consumers to flip two separate
 * switches in sync, `registerLogsPrinter` sets a `config.env` flag when it runs, and
 * `registerLogsCollector`/`registerSupport` only turn the collector on if that flag is present.
 * Since `setupNodeEvents` (Node process) always runs before any spec's support file (browser
 * process) — see the "which runs first" note this API was designed around — the flag is always
 * set in time. Practically, this means enabling logging is a single call in the plugins file:
 *
 * ```js
 * // plugins/index.js — this alone turns on BOTH the printer and (automatically) the collector
 * setupNodeEvents(on, config) {
 *     require('@jahia/cypress/dist/plugins/registerPlugins').registerPlugins(on, config);
 *     require('@jahia/cypress/dist/plugins/logsPrinter').registerLogsPrinter(on, config);
 *     // or, to override printer options: registerLogsPrinter(on, config, {printLogsToFile: 'onFail'});
 *     return config;
 * }
 *
 * // support/e2e.js — registerSupport() needs no changes; the collector activates automatically.
 * // Pass `logsCollector` only if you want to override the collector's own options:
 * require('@jahia/cypress/dist/support/registerSupport').registerSupport({
 *     logsCollector: {collectTypes: ['cy:command', 'cy:xhr']}
 * });
 * ```
 *
 * If `registerLogsPrinter` is never called, `registerSupport()` stays a no-op for logging — nothing
 * to enable, nothing that can break.
 */

export const envVarLogsPrinterEnabled = 'JAHIA_HOOKS_TERMINAL_LOGGER_ENABLED';

/**
 * Checks whether `registerLogsPrinter` marked itself as enabled via `enableLogsPrinter`. Only
 * meaningful in the browser/support context, where `Cypress.env()` reflects whatever the
 * Node/plugins process set.
 * @returns {boolean} true if the printer is enabled, false otherwise.
 */
function isLogsPrinterEnabled(): boolean {
    return Boolean(Cypress.env(envVarLogsPrinterEnabled));
}

/**
 * Installs cypress-terminal-report's collector (browser/support side) with Jahia's default logging
 * setup, but only if `registerLogsPrinter` was called in the plugins file (checked via
 * `isLogsPrinterEnabled`) — otherwise this is a no-op, since running the collector without the
 * printer would break every test with a "no task registered" error (see module doc above).
 * Called automatically from `registerSupport`. Pass `options` to override any of the defaults.
 *
 * @example
 * registerLogsCollector(); // defaults, only if the printer is enabled
 * registerLogsCollector({collectTypes: ['cy:command', 'cy:xhr']}); // override an option
 */
export const registerLogsCollector = (options: SupportOptions = {}): void => {
    if (!isLogsPrinterEnabled()) {
        return;
    }

    installLogsCollector({
        enableExtendedCollector: true,
        collectTypes: ['cons:log', 'cons:info', 'cons:error', 'cy:log', 'cy:xhr', 'cy:fetch', 'cy:request', 'cy:intercept', 'cy:command'],
        ...options
    });
};
