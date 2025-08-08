/* eslint-disable brace-style */
/* eslint-disable max-statements-per-line */
/**
 * Module for monitoring and reporting JavaScript errors and warnings in Cypress tests.
 * Provides methods to enable, disable, and check logger status.
 */

const envVarDisabled = 'JAHIA_HOOKS_DISABLED';
const envVarCollector = '__JS_LOGGER_FAILURES__';
const envVarAllowedWarnings = '__JS_LOGGER_ALLOWED_WARNINGS__';
const envVarStrategy = '__JS_LOGGER_STRATEGY__';

/**
 * Strategy for handling JavaScript errors and warnings in Cypress tests.
 *
 * - failFast: Fail *immediately* when an error is detected.
 *
 *   Proc: Allows each test to run, looks for console errors and warnings, and fails the particular test IMMEDIATELY
 *         if any issues are found.
 *   Cons: If errors or warnings were found during beforeEach or afterEach hook(s), the rest of spec will be ignored.
 *
 * - failAfterEach: Collect all errors and warnings *during test* execution and fail if any issues are found.
 *
 *   Proc: Allows each test to run, collects console errors and warnings, and fails the particular test by the end of it's execution
 *         if any issues are found.
 *   Cons: If errors or warnings were found during beforeEach or afterEach hook(s), the rest of spec will be ignored.
 *
 * - failAfterAll: Collect all errors and warnings *after all tests* and fail at the end of the test suite.
 *
 *  Proc: Allows all tests to run, collects console errors and warnings, and fails the test suite at the end if any issues are found.
 *         This is useful for reporting all issues at once after all tests are executed, rather than failing immediately on the first issue.
 *   Cons: Reporting might be confusing, e.g. - cypress will report the very last test as failed, while many tests might have issues.
 *         This is because the hook is executed after all tests are completed, so the last test is reported as failed.
 */
enum STRATEGY { failFast, failAfterAll, failAfterEach }

/**
 * Auxiliary type to represent a single item in the collector.
 * It contains the test title and an array of error or warning messages collected during the test.
 */
type CollectorItem = {
    test: string; // The title of the test where the issue was found
    errors: string[]; // Array of error or warning messages collected during the test
};

/**
 * Returns the current strategy for handling JavaScript errors and warnings in Cypress tests.
 * @returns {STRATEGY} - The current strategy for handling JavaScript errors and warnings.
 * @note be careful with Cypress.env(envVarStrategy), since it might return `0` for `failFast` strategy,
 *       which is falsy in JavaScript, so we need to check if the variable is undefined.
 */
function getStrategy(): STRATEGY {
    return typeof Cypress.env(envVarStrategy) === 'undefined' ? STRATEGY.failFast : Cypress.env(envVarStrategy);
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
function isDisabled(): boolean { return Cypress.env(envVarDisabled) === true; }

/**
 * Disables the js errors and warnings logger.
 * @returns {void}
 */
function disable(): void { Cypress.env(envVarDisabled, true); }

/**
 * Enables the js errors and warnings logger.
 * @returns {void}
 */
function enable(): void { Cypress.env(envVarDisabled, false); }

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
 * This interceptor is executed before the page is loaded, allowing us to spy on console messages.
 */
function attachJsInterceptor(): void {
    Cypress.on('window:before:load', window => {
        // Skip 'window:before:load' hook if the logger is not enabled
        if (isDisabled()) { return; }

        // Spy on console.error and console.warn to capture errors and warnings
        cy.spy(window.console, 'error').as('errors');
        cy.spy(window.console, 'warn').as('warnings');
    });
}

/**
 * Collects JavaScript errors and warnings using the spies set up in attachJsInterceptor.
 * @returns {Cypress.Chainable} - Cypress chainable object that resolves when issues are collected.
 */
function collectIssues(): Cypress.Chainable {
    const allowedWarnings = getAllowedJsWarnings();
    let consoleIssues: string[] = [];

    // Look for console errors and warnings, collected by the spies
    return cy.get('@errors')
        .invoke('getCalls')
        .then(errorCalls => {
            // All errors should be collected
            consoleIssues = errorCalls.flatMap((call: { args: string[] }) => call.args);

            // Analyze warnings
            cy.get('@warnings')
                .invoke('getCalls')
                .then(warningCalls => {
                    warningCalls.flatMap((call: { args: string[] }) => call.args).forEach((arg: string) => {
                        // Only warnings not in the allowed list should be collected
                        if (!allowedWarnings.some((item: string) => arg.includes(item))) { consoleIssues.push(arg); }
                    });
                });
        })
        .then(() => {
            // Update the Cypress environment variable with the collected issues
            if (consoleIssues.length > 0) {
                setCollectedIssues([
                    ...getCollectedIssues(),
                    {test: Cypress.currentTest.title, errors: consoleIssues}
                ]);
            }
        })
        .then(() => {
            // Return a Cypress chainable object to allow chaining
            return cy.wrap(null, {log: false});
        });
}

/**
 * Analyzes collected JavaScript errors and warnings and throws an error if any were found.
 */
function analyzeIssues(): void {
    cy.then(() => {
        const failures = getCollectedIssues();
        if (failures.length > 0) {
            // Format the error message for each test
            const errorMessage = failures.map((failure: { test: string; errors: string[]; }) => {
                return `TEST: ${failure.test}\nISSUES:\n${failure.errors.map((e: string) => `- ${e}`).join('\n')}`;
            }).join('\n\n');
            // Reset the collector for the next test run
            setCollectedIssues([]);

            // Throw an error with the collected issues
            throw new Error('CONSOLE ERRORS and WARNINGS FOUND:\n\n' + errorMessage);
        }
    });
}

/**
 * Attaches custom hooks to Cypress events to monitor and report JavaScript errors and warnings.
 * This method is called automatically in registerSupport.ts#registerSupport
 * It sets up listeners for console errors and warnings, collects them after each test,
 * and throws an error if any issues are found after all tests are executed.
 */
function attach(): void {
    // Attach errors and warnings collector
    attachJsInterceptor();

    /**
     * Custom 'afterEach' hook to collect JavaScript errors and warnings after each test execution.
     * The behavior of this hook depends on the strategy set for the logger.
     */
    afterEach(() => {
        // Skip the hook if the logger is disabled
        if (isDisabled()) { return; }

        // Depending on the strategy, collect issues and analyze them
        // If the strategy is failFast, issues will be collected in 'window:load'
        if (getStrategy() === STRATEGY.failAfterEach) {
            // Collect issues after each test and analyze them immediately
            collectIssues().then(() => analyzeIssues());
        } else if (getStrategy() === STRATEGY.failAfterAll) {
            // Collect issues after each test, but analyze them only after all tests are executed
            collectIssues();
        } else {
            // Do nothing for failFast strategy, issues will be collected and analyzed in 'window:load' hook
        }
    });

    /**
     * Custom 'after' hook to analyze collected errors and warnings after all tests are executed.
     */
    after(() => {
        // Skip the hook if the logger is disabled or if the strategy is not failAfterAll
        // This hook is only relevant for the failAfterAll strategy, where we analyze issues after
        if (isDisabled() || getStrategy() !== STRATEGY.failAfterAll) { return; }

        // Analyze collected errors and warnings
        analyzeIssues();
    });

    /**
     * Custom 'window:load' hook to collect JavaScript errors and warnings right after the page is loaded.
     * Applicable only for the failFast strategy.
     */
    Cypress.on('window:load', () => {
        // Skip the hook if the logger is disabled or if the strategy is not failFast
        if (isDisabled() || getStrategy() !== STRATEGY.failFast) { return; }

        // Collect issues immediately after the window is loaded and analyze them
        collectIssues().then(() => analyzeIssues());
    });
}

/**
 * Exports the jsLogger module with methods to attach hooks, enable/disable logging, and set allowed warnings.
 */
export const JahiaHooks = {
    attach,
    setAllowedJsWarnings,
    getAllowedJsWarnings,
    setStrategy,
    getStrategy,
    enable,
    disable,
    STRATEGY
};
