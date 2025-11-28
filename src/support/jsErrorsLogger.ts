/* eslint-disable brace-style */
/* eslint-disable max-statements-per-line */

/**
 * Module for monitoring and reporting JavaScript errors and warnings in Cypress tests.
 * Provides methods to enable, disable, and check logger status.
 */

const envVarDisableAll = 'JAHIA_HOOKS_DISABLE';
const envVarDisableJsLogger = 'JAHIA_HOOKS_DISABLE_JS_LOGGER';
const envVarCollector = '__JS_LOGGER_FAILURES__';
const envVarAllowedWarnings = '__JS_LOGGER_ALLOWED_WARNINGS__';
const envVarStrategy = '__JS_LOGGER_STRATEGY__';

/**
 * Strategy for handling JavaScript errors and warnings in Cypress tests.
 *
 * - failAfterEach: Collect all errors and warnings *during test* execution and fail if any issues are found.
 *
 *   Proc: Allows each test to run, collects console errors and warnings,
 *         and fails the particular test by the end of its execution if any issues are found.
 *   Cons: Since the analysis happens in afterEach() hook, the rest of spec will be ignored.
 *
 * - failAfterAll: Collect all errors and warnings *after all tests* and fail at the end of the test suite.
 *
 *  Proc: Allows all tests to run, collects console errors and warnings, and fails the test suite at the end if any issues are found.
 *         This is useful for reporting all issues at once after all tests are executed, rather than failing immediately on the first issue.
 *   Cons: Reporting might be confusing, e.g. - cypress will report the very last test as failed, while many tests might have issues.
 *         This is because the hook is executed after all tests are completed, so the last test is reported as failed.
 */
enum STRATEGY { failAfterEach, failAfterAll }

/**
 * Auxiliary type to represent a single item in the collector.
 * It contains the test title and an array of error or warning messages collected during the test.
 */
type CollectorItem = {
    url: string; // URL of the current page where the issue was found
    test: string; // The title of the test where the issue was found
    errors: {type: string; msg: string}[]; // Array of error or warning messages collected during the test
};

/**
 * Returns an emoji based on the type of message.
 * @param {string} type
 */
function getEmoji(type: string): string {
    switch (type) {
        case 'warn':
            return '⚠️';
        case 'error':
            return '❌️';
        default:
            return '';
    }
}

/**
 * Returns the current strategy for handling JavaScript errors and warnings in Cypress tests.
 * @returns {STRATEGY} - The current strategy for handling JavaScript errors and warnings.
 * @note be careful with Cypress.env(envVarStrategy), since it might return `0` for `failAfterEach` strategy,
 *       which is falsy in JavaScript, so we need to check if the variable is undefined.
 */
function getStrategy(): STRATEGY {
    return typeof Cypress.env(envVarStrategy) === 'undefined' ? STRATEGY.failAfterAll : Cypress.env(envVarStrategy);
}

/**
 * Sets the strategy for handling JavaScript errors and warnings in Cypress tests.
 * @param {STRATEGY} strategy - Strategy for handling JavaScript errors and warnings.
 * @throws {Error} If an invalid strategy is provided.
 * @returns {void}
 */
function setStrategy(strategy: STRATEGY): void { Cypress.env(envVarStrategy, strategy); }

/**
 * Returns console issues collected during the test execution.
 * @returns {CollectorItem []} - Array of collected issues, each issue is an object with test title and errors.
 */
function getCollectedIssues(): CollectorItem [] { return Cypress.env(envVarCollector) || []; }

/**
 * Sets the console issues collected during the test execution.
 * @returns {void}
 */
function setCollectedIssues(items: CollectorItem []): void { Cypress.env(envVarCollector, items); }

/**
 * Checks if the js errors and warnings logger is disabled.
 * @returns {boolean} - true if the logger is disabled, false otherwise.
 */
function isDisabled(): boolean { return ((Cypress.env(envVarDisableAll) === true) || (Cypress.env(envVarDisableJsLogger) === true)); }

/**
 * Returns the list of allowed warnings that will not be reported by the logger.
 * @returns {string[]} - Array of allowed warning messages.
 */
function getAllowedJsWarnings(): string[] { return Cypress.env(envVarAllowedWarnings) || []; }

/**
 * Sets the list of allowed warnings that will not be reported by the logger.
 * @param warnings {string[]} - Array of warning messages to be allowed.
 * @return {void}
 */
function setAllowedJsWarnings(warnings: string[]): void { Cypress.env(envVarAllowedWarnings, warnings); }

/**
 * Attaches a custom JavaScript interceptor to capture console errors and warnings.
 */
function attachJsInterceptor(): void {
    /**
     * Custom 'window:before:load' hook to attach interceptors before the page is loaded and spy on console messages.
     */
    cy.on('window:before:load', window => {
        // Skip 'window:before:load' hook if the logger is disabled
        if (isDisabled()) { return; }
        // Spy on console.error and console.warn methods to capture errors and warnings
        cy.spy(window.console, 'error').as('errors');
        cy.spy(window.console, 'warn').as('warnings');
    });

    /**
     * Custom 'window:load' hook to collect JavaScript errors and warnings right after the page is loaded.
     */
    cy.on('window:load', win => {
        // Skip 'window:load' hook if the logger is disabled
        if (isDisabled()) { return; }
        // Collect errors and warnings after the page is fully loaded
        collectIssues(win);
    });
}

/**
 * Collects JavaScript errors and warnings using the spies set up in attachJsInterceptor.
 * @returns {Cypress.Chainable} - Cypress chainable object that resolves when issues are collected.
 */
function collectIssues(win: Cypress.AUTWindow): Cypress.Chainable {
    let consoleIssues: {type: string, msg: string}[] = [];

    // Look for console errors and warnings, collected by the spies
    return cy.get('@errors')
        .invoke('getCalls')
        .then(errorCalls => {
            // All errors should be collected
            consoleIssues = errorCalls.flatMap((call: { args: unknown[] }) => call.args.map((arg: string) => ({type: 'error', msg: String(arg)})));
        })
        .then(() => {
            // Analyze warnings - return the chain to maintain proper async flow
            return cy.get('@warnings')
                .invoke('getCalls')
                .then(warningCalls => {
                    const allowedWarnings = getAllowedJsWarnings();
                    warningCalls.flatMap((call: { args: unknown[] }) => call.args).forEach((arg: string) => {
                        // Only warnings not in the allowed list should be collected
                        if (!allowedWarnings.some((item: string) => arg.includes(item))) { consoleIssues.push({type: 'warn', msg: String(arg)}); }
                    });
                });
        })
        .then(() => {
            // Update the Cypress environment variable with the collected issues
            if (consoleIssues.length > 0) {
                setCollectedIssues([
                    ...getCollectedIssues(),
                    {url: win.location.href, test: Cypress.currentTest.title, errors: consoleIssues}
                ]);
            }
        });
}

/**
 * Analyzes collected JavaScript errors and warnings and throws an error if any were found.
 */
function analyzeIssues(): Cypress.Chainable {
    return cy.wrap(getCollectedIssues()).then(failures => {
        if (failures.length > 0) {
            // Group all issues by test title
            const groupedByTest = failures.reduce((acc: Record<string, CollectorItem[]>, failure) => {
                acc[failure.test] = acc[failure.test] || [];
                acc[failure.test].push(failure);

                return acc;
            }, {} as Record<string, CollectorItem[]>);

            // Format the error message for each test with its collected issues
            const errorMessage = Object.entries(groupedByTest).map(([test, items]) => {
                const urlsAndErrors = items.map(item =>
                    `URL: ${item.url}\nISSUES:\n${item.errors.map((e: {
                        type: string;
                        msg: string
                    }) => `- ${e.type === 'warn' ? getEmoji('warn') : getEmoji('error')} ${e.msg}`).join('\n')}`
                ).join('\n\n');

                // Return the formatted message for the test;
                // Intentionally use fixed-width (50 chars) separators for better readability,
                // when the message might be wrapped
                return `${getEmoji('error')}️ TEST: ${test.trim()} ${getEmoji('error')}️\n${'-'.repeat(50)}\n${urlsAndErrors}\n${'='.repeat(50)}`;
            }).join('\n\n');

            // Reset the collector for the next test run
            setCollectedIssues([]);

            // Throw an error with the collected issues
            throw new Error('CONSOLE ERRORS and WARNINGS FOUND:\n\n' + errorMessage);
        }
    });
}

/**
 * Disables the js errors and warnings logger.
 * @returns {void}
 */
function disable(): void { Cypress.env(envVarDisableJsLogger, true); }

/**
 * Attaches custom hooks to Cypress events to monitor and report JavaScript errors and warnings.
 * It sets up listeners for console errors and warnings, collects them for each visited URL in each test,
 * and throws an error if any issues are found after each or all tests are executed (depending on the strategy chosen).
 */
function enable(): void {
    // Ensure the logger is enabled
    Cypress.env(envVarDisableJsLogger, false);

    /**
     * Attach Cypress hooks forconsole messages collecting before EACH test execution.
     * Use 'beforeEach' hook and local (cy) context instead of global (Cypress) one
     * to ensure proper async flow and avoid events and hooks flakiness.
     */
    before(() => {
        attachJsInterceptor();
    });

    /**
     * Custom 'afterEach' hook to analyze JavaScript errors and warnings after EACH test execution.
     */
    afterEach(() => {
        // Skip the hook if the logger is disabled or if the strategy is not failAfterEach
        if (isDisabled() || (getStrategy() !== STRATEGY.failAfterEach)) { return; }
        // Analyze collected errors and warnings
        analyzeIssues();
    });

    /**
     * Custom 'after' hook to analyze JavaScript errors and warnings after ALL tests execution.
     */
    after(() => {
        // Skip the hook if the logger is disabled or if the strategy is not failAfterAll
        if (isDisabled() || (getStrategy() !== STRATEGY.failAfterAll)) { return; }
        // Analyze collected errors and warnings
        analyzeIssues();
    });
}

/**
 * Exports the jsLogger module with methods to attach hooks, enable/disable logging, and set allowed warnings.
 */
export const jsErrorsLogger = {
    setAllowedJsWarnings,
    getAllowedJsWarnings,
    setStrategy,
    getStrategy,
    enable,
    disable,
    STRATEGY
};
