/* eslint-disable brace-style */
/* eslint-disable max-statements-per-line */
/**
 * Module for monitoring and reporting JavaScript errors and warnings in Cypress tests.
 * Provides methods to enable, disable, and check logger status.
 */

const envVarDisabled = 'JS_LOGGER_DISABLED';
const envVarCollector = '__JS_LOGGER_FAILURES__';
const envVarAllowedWarnings = '__JS_LOGGER_ALLOWED_WARNINGS__';
const envVarStrategy = '__JS_LOGGER_STRATEGY__';

/**
 * Strategy for handling JavaScript errors and warnings in Cypress tests.
 * - failFast: Fail *immediately* when an error is detected.
 * - failAfterEach: Collect all errors and warnings *during test* execution and fail if any issues are found.
 * - failAfterAll: Collect all errors and warnings *after all tests* and fail at the end of the test suite.
 */
enum STRATEGY { failFast, failAfterAll, failAfterEach }

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
 * Checks if the js errors and warnings logger is disabled.
 * @returns {boolean} - true if the logger is disabled, false otherwise.
 */
function isDisabled(): boolean { return Cypress.env(envVarDisabled) === true; }

/**
 * Sets the list of allowed warnings that will not be reported by the logger.
 * @param warnings {string[]} - Array of warning messages to be allowed.
 * @return {void}
 */
function setAllowedJsWarnings(warnings: string[]): void { Cypress.env(envVarAllowedWarnings, warnings); }

/**
 * Attaches custom hooks to Cypress events to monitor and report JavaScript errors and warnings.
 * This method is called automatically in registerSupport.ts#registerSupport
 * It sets up listeners for console errors and warnings, collects them after each test,
 * and throws an error if any issues are found after all tests are executed.
 */
function attachHook(): void {
    // Skip hook attachment if the logger is disabled (e.g. from CI/CD pipeline)
    if (isDisabled()) { return; }

    switch (getStrategy()) {
        case STRATEGY.failAfterAll:
            attachFailAfterAll();
            break;
        case STRATEGY.failAfterEach:
            attachFailAfterEach();
            break;
        default:
            attachFailFast();
    }
}

/**
 * Custom hook implementation which fails the test after all tests are executed if any JavaScript errors or warnings are found.
 *
 * Proc: Allows all tests to run, collects console errors and warnings, and fails the test suite at the end if any issues are found.
 *       This is useful for reporting all issues at once after all tests are executed, rather than failing immediately on the first issue.
 * Cons: Reporting might be confusing, e.g. - cypress will report the very last test as failed, while many tests might have issues.
 *       This is because the hook is executed after all tests are completed, so the last test is reported as failed.
 */
function attachFailAfterAll(): void {
    /**
     * Custom 'window:before:load' hook to spy on console errors and warnings
     * This hook is executed before the page is loaded, allowing us to capture console messages.
     */
    Cypress.on('window:before:load', window => {
        // Skip 'window:before:load' hook if the logger is not enabled
        // Double-check in case if functionality was disabled within the test-case code
        // to skip js validations for some particular test and enable it afterward
        if (isDisabled()) { return; }

        cy.spy(window.console, 'error').as('errors');
        cy.spy(window.console, 'warn').as('warnings');
    });

    /**
     * Custom 'afterEach' hook to collect console errors and warnings
     */
    afterEach(() => {
        // Skip 'afterEach' hook if the logger is not enabled
        // Double-check in case if functionality was disabled within the test-case code
        // to skip js validations for some particular test and enable it afterward
        if (isDisabled()) { return; }

        let consoleIssues = [];
        const allowedWarnings = Cypress.env(envVarAllowedWarnings) || [];

        // All errors should be collected
        cy.get('@errors')
            .invoke('getCalls')
            .then(calls => { consoleIssues = calls; });

        // Only warnings not in the allowed list should be collected
        cy.get('@warnings')
            .invoke('getCalls')
            .each((call: { args: string[]}) => {
                call.args.forEach((arg: string) => {
                    if (!allowedWarnings.some((item: string) => arg.includes(item))) {
                        consoleIssues.push(arg);
                    }
                });
            });

        // Collect all issues and store them in the Cypress environment variable for later usage
        cy.then(() => {
            if (consoleIssues.length > 0) {
                Cypress.env(envVarCollector, [...(Cypress.env(envVarCollector) || []), {
                    test: Cypress.currentTest.title,
                    errors: consoleIssues
                }]);
            }
        });
    });

    /**
     * Custom 'after' hook to analyze collected errors and warnings after all tests are executed.
     */
    after(() => {
        // Skip 'after' hook if the logger is not enabled
        // Double-check in case if functionality was disabled within the test-case code
        // to skip js validations for some particular test and enable it afterward
        if (isDisabled()) { return; }

        // Analyze collected errors and warnings
        const failures = Cypress.env(envVarCollector) || [];
        cy.log('[JS ERRORS LOGGER] Analyze collected issues').then(() => {
            if (failures.length > 0) {
                // Format the error message for each test
                const errorMessage = failures.map((failure: { test: string; errors: string[]; }) => {
                    return `TEST: ${failure.test}\nISSUES:\n${failure.errors.map((e: string) => `- ${e}`).join('\n')}`;
                }).join('\n\n');
                // Throw an error with the collected issues
                throw new Error('CONSOLE ERRORS and WARNINGS FOUND:\n' + errorMessage);
            } else {
                cy.log('[JS ERRORS LOGGER] No console errors or warnings found.');
            }
        });
    });
}

/**
 * Custom hook implementation which fails the test after each test execution if any JavaScript errors or warnings are found.
 *
 * Proc: Allows each test to run, collects console errors and warnings, and fails the particular test by the end of it's execution
 *       if any issues are found.
 * Cons: If errors or warnings were found during beforeEach or afterEach hook(s), the rest of spec will be ignored.
 */
function attachFailAfterEach(): void {
    // Double-check in case if functionality was disabled within the test-case code
    // to skip js validations for some particular test and enable it afterward
    if (isDisabled()) { return; }

    /**
     * Custom 'window:before:load' hook to spy on console errors and warnings
     * This hook is executed before the page is loaded, allowing us to capture console messages.
     */
    Cypress.on('window:before:load', window => {
        cy.spy(window.console, 'error').as('errors');
        cy.spy(window.console, 'warn').as('warnings');
    });

    /**
     * Custom 'afterEach' hook to collect console errors and warnings
     */
    afterEach(() => {
        let consoleIssues = [];
        const allowedWarnings = Cypress.env(envVarAllowedWarnings) || [];

        // All errors should be collected
        cy.get('@errors')
            .invoke('getCalls')
            .then(calls => { consoleIssues = calls; });

        // Only warnings not in the allowed list should be collected
        cy.get('@warnings')
            .invoke('getCalls')
            .each((call: { args: string[]}) => {
                call.args.forEach((arg: string) => {
                    if (!allowedWarnings.some((item: string) => arg.includes(item))) {
                        consoleIssues.push(arg);
                    }
                });
            });

        // Analyze collected errors and warnings
        cy.log('[JS ERRORS LOGGER] Analyze collected issues').then(() => {
            if (consoleIssues.length > 0) {
                // Format the error message for each test
                const errorMessage = consoleIssues.map((e: string) => `- ${e}`).join('\n');
                // Throw an error with the collected issues
                throw new Error('CONSOLE ERRORS and WARNINGS FOUND:\n' + errorMessage);
            } else {
                cy.log('[JS ERRORS LOGGER] No console errors or warnings found.');
            }
        });
    });
}

/**
 * Custom hook implementation which fails the test immediately when a JavaScript error or warning is detected.
 *
 * Proc: Allows each test to run, looks for console errors and warnings, and fails the particular test IMMEDIATELLY
 *       if any issues are found.
 * Cons: If errors or warnings were found during beforeEach or afterEach hook(s), the rest of spec will be ignored.
 */
function attachFailFast(): void {
    // Double-check in case if functionality was disabled within the test-case code
    // to skip js validations for some particular test and enable it afterward
    if (isDisabled()) { return; }

    /**
     * Custom 'window:before:load' hook to spy on console errors and warnings
     * This hook is executed before the page is loaded, allowing us to capture console messages.
     */
    Cypress.on('window:before:load', window => {
        cy.spy(window.console, 'error').as('errors');
        cy.spy(window.console, 'warn').as('warnings');
    });

    Cypress.on('window:load', () => {
        // DOM should be loaded and parsed by now, so we can check for console errors and warnings
        let consoleIssues = [];
        const allowedWarnings = Cypress.env(envVarAllowedWarnings) || [];

        // All errors should be collected
        cy.get('@errors')
            .invoke('getCalls')
            .then(calls => { consoleIssues = calls; });

        // Only warnings not in the allowed list should be collected
        cy.get('@warnings')
            .invoke('getCalls')
            .each((call: { args: string[]}) => {
                call.args.forEach((arg: string) => {
                    if (!allowedWarnings.some((item: string) => arg.includes(item))) {
                        consoleIssues.push(arg);
                    }
                });
            }).then(() => {
                if (consoleIssues.length > 0) {
                    // Format the error message for each test
                    const errorMessage = consoleIssues.map((e: string) => `- ${e}`).join('\n');
                    // Throw an error with the collected issues
                    throw new Error('CONSOLE ERRORS and WARNINGS FOUND:\n' + errorMessage);
                } else {
                    cy.log('[JS ERRORS LOGGER] No console errors or warnings found.');
                }
            });
    });
}

/**
 * Exports the jsLogger module with methods to attach hooks, enable/disable logging, and set allowed warnings.
 */
export const jsErrorsLogger = {
    attachHook,
    setAllowedJsWarnings,
    setStrategy,
    STRATEGY
};
