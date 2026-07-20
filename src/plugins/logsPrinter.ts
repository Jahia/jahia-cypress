import installLogsPrinter from 'cypress-terminal-report/src/installLogsPrinter';
import type {PluginOptions} from 'cypress-terminal-report/src/installLogsPrinter.types';
import {envVarLogsPrinterEnabled} from '../support/logsCollector';

/**
 *  Jahia's default cypress-terminal-report setup (https://github.com/archfz/cypress-terminal-report).
 *  Node/plugins-side half of the setup, which registers the `ctrLogMessages`/`ctrLogFiles` task handlers
 *  and writes the collected logs to files (and/or prints them to the terminal) once a run finishes.
 *
 *  see support/logsCollector.ts for the complementary collector-side half of this setup, which gathers
 *  cy commands, console logs, etc., and sends them to the Node process via `cy.task('ctrLogMessages'/'ctrLogFiles', ...)`.
 */

// See support/logsCollector.ts for the complementary collector-side half of this setup.
// This env var is set in the Node/plugins process and read back in the browser/support process, so
// the collector knows whether the printer was enabled (and thus whether it should enable itself).
// const envVarLogsPrinterEnabled = 'JAHIA_HOOKS_TERMINAL_LOGGER_ENABLED';

/**
 * Marks the printer as enabled, by setting a `config.env` flag that `envVarLogsPrinterEnabled` reads
 * back on the browser side. Must run in the Node/plugins process, since that's the only place
 * `config` (and its `env` object shared with the browser via `Cypress.env()`) is available.
 * @param config - the Cypress plugin config passed to `registerLogsPrinter`.
 */
function enableLogsPrinter(config: Cypress.PluginConfigOptions): void {
    config.env[envVarLogsPrinterEnabled] = true;
}

/**
 * Installs cypress-terminal-report's printer (Node/plugins side) with Jahia's default logging setup
 * (plain text log files under `results/logs/`, printed to console on failure only), and marks
 * itself as enabled so `registerLogsCollector`/`registerSupport` know to enable the collector too.
 * Must be called from the plugins file's `setupNodeEvents(on, config)` — see the module doc above.
 * Pass `options` to override any of the defaults.
 *
 * @example
 * registerLogsPrinter(on, config); // defaults
 * registerLogsPrinter(on, config, {printLogsToFile: 'onFail'}); // override an option
 */
export const registerLogsPrinter = (
    on: Cypress.PluginEvents,
    config: Cypress.PluginConfigOptions,
    options: PluginOptions = {}
): void => {
    enableLogsPrinter(config);

    installLogsPrinter(on, {
        outputRoot: config.projectRoot + '/results/logs/',
        specRoot: 'cypress/e2e',
        outputTarget: {
            '.|log': 'txt'
        },
        printLogsToConsole: 'onFail',
        printLogsToFile: 'always',
        includeSuccessfulHookLogs: true,
        ...options
    });
};
