/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable brace-style */
/* eslint-disable max-statements-per-line */
/**
 * Module for monitoring and reporting JavaScript errors and warnings in Cypress tests.
 * Provides methods to enable, disable, and check logger status.
 */

const envVarDisabled = 'JS_LOGGER_DISABLED';
const envVarJsLoggerDisabled = 'JS_LOGGER_DISABLED';
const envVarStrategy = '__JAHIA_HOOKS_STRATEGY__';
const envVarJsCollector = '__JS_LOGGER_FAILURES__';
const envVarAllowedJsWarnings = '__JS_LOGGER_ALLOWED_WARNINGS__';

/**
 * Strategy for handling JavaScript errors, warnings and other issues in Cypress tests.
 * - failFast: Fail *immediately* when an error is detected.
 * - failAfterEach: Collect all errors and warnings *during test* execution and fail if any issues are found.
 * - failAfterAll: Collect all errors and warnings *after all tests* and fail at the end of the test suite.
 */
enum STRATEGY { failFast, failAfterAll, failAfterEach }

/**
 * Returns the current strategy for handling JavaScript errors, warnings and other issues in Cypress tests.
 * @returns {STRATEGY} - The current strategy in use.
 * @note be careful with Cypress.env(envVarStrategy), since it might return `0` for `failFast` strategy,
 *       which is falsy in JavaScript, so we need to check if the variable is undefined.
 */
function getStrategy(): STRATEGY {
    return typeof Cypress.env(envVarStrategy) === 'undefined' ? STRATEGY.failFast : Cypress.env(envVarStrategy);
}

/**
 * Sets the strategy for handling JavaScript errors, warnings and other issues in Cypress tests.
 * @param {STRATEGY} strategy - Strategy to be used.
 * @throws {Error} If an invalid strategy is provided.
 * @returns {void}
 */
function setStrategy(strategy: STRATEGY): void { Cypress.env(envVarStrategy, strategy); }

/**
 * Checks if all Jahia Hooks are disabled.
 * @returns {boolean} - true if the logger is disabled, false otherwise.
 */
function isDisabled(): boolean { return Cypress.env(envVarDisabled) === true; }

/**
 * Checks if the js errors and warnings logger is disabled.
 * @returns {boolean} - true if the logger is disabled, false otherwise.
 */
function isJsLoggerDisabled(): boolean { return Cypress.env(envVarJsLoggerDisabled) === true; }

/**
 * Sets the list of allowed warnings that will not be reported by the logger.
 * @param warnings {string[]} - Array of warning messages to be allowed.
 * @return {void}
 */
function setAllowedJsWarnings(warnings: string[]): void { Cypress.env(envVarAllowedJsWarnings, warnings); }

/**
 * Attaches custom hooks to Cypress events to monitor and report JavaScript errors and warnings.
 * This method is called automatically in registerSupport.ts#registerSupport
 * It sets up listeners for console errors and warnings, collects them after each test,
 * and throws an error if any issues are found after all tests are executed.
 */
function attach(): void {
    // Skip hook attachment if the logger is disabled (e.g. from CI/CD pipeline)
    if (isDisabled()) { return; }

    attachJsInterceptor();

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
 * Attaches a custom JavaScript interceptor to capture console errors and warnings.
 * This interceptor is executed before the page is loaded, allowing us to spy on console messages.
 */
function attachJsInterceptor(): void {
    if (isJsLoggerDisabled()) { return; }

    Cypress.on('window:before:load', window => {
        cy.spy(window.console, 'error').as('errors');
        cy.spy(window.console, 'warn').as('warnings');
    });
}

/**
 * Collects JavaScript errors and warnings after each test execution.
 * If the strategy is failFast, it throws an error with the collected issues.
 * If the strategy is failAfterEach or failAfterAll, it collects issues for later analysis.
 */
function collectIssues(): any {
    // All errors should be collected
    cy.get('@errors')
        .invoke('getCalls')
        .then(errors => {
            // Only warnings not in the allowed list should be collected
            cy.get('@warnings')
                .invoke('getCalls')
                .each((call: { args: string[]}) => {
                    call.args.forEach((arg: string) => {
                        if (!(Cypress.env(envVarAllowedJsWarnings) || []).some((item: string) => arg.includes(item))) {
                            errors.push(arg);
                        }
                    });
                }).then(() => {
                    if (errors.length > 0) {
                        Cypress.env(envVarJsCollector, [...(Cypress.env(envVarJsCollector) || []), {
                            test: Cypress.currentTest.title,
                            errors: errors
                        }]);

                        // If the strategy is failFast, throw an error with the collected issues
                        // Described as a separate step for scalability purposes, so we can add more logic later if needed
                        // e.g. - analyze wrong headers, etc
                        if (getStrategy() === STRATEGY.failFast) {
                            // Throw an error with the collected issues
                            throw new Error('CONSOLE ERRORS and WARNINGS FOUND:\n\n' + errors.join('\n'));
                        }
                    }
                });
        });
}

/**
 * Analyzes collected JavaScript errors and warnings after all tests are executed.
 */
function analyzeIssues(): void {
    cy.then(() => {
        const failures = Cypress.env(envVarJsCollector) || [];
        if (failures.length > 0) {
            // Format the error message for each test
            const errorMessage = failures.map((failure: { test: string; errors: string[]; }) => {
                return `TEST: ${failure.test}\nISSUES:\n${failure.errors.map((e: string) => `- ${e}`).join('\n')}`;
            }).join('\n\n');
            // Throw an error with the collected issues
            throw new Error('CONSOLE ERRORS and WARNINGS FOUND:\n\n' + errorMessage);
        }
    });
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
    // Double-check in case if functionality was disabled within the test-case code
    if (isDisabled()) { return; }

    afterEach(() => {
        // Double-check in case if functionality was disabled within the test-case code
        if (isDisabled()) { return; }

        collectIssues();
    });

    after(() => {
        // Double-check in case if functionality was disabled within the test-case code
        if (isDisabled()) { return; }

        // Analyze collected errors and warnings
        analyzeIssues();
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
    if (isDisabled()) { return; }

    afterEach(() => {
        // Double-check in case if functionality was disabled within the test-case code
        if (isDisabled()) { return; }

        collectIssues();
        analyzeIssues();
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
    if (isDisabled()) { return; }

    // DOM should be loaded and parsed by now, so we can check for console errors and warnings
    Cypress.on('window:load', () => {
        // Double-check in case if functionality was disabled within the test-case code
        if (isDisabled()) { return; }

        collectIssues();
    });
}

/**
 * Exports the jsLogger module with methods to attach hooks, enable/disable logging, and set allowed warnings.
 */
export const jsErrorsLogger = {
    attach,
    setAllowedJsWarnings,
    setStrategy,
    STRATEGY
};
