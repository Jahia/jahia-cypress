/* eslint-disable brace-style */
/* eslint-disable max-statements-per-line */
/**
 * Module for monitoring and reporting JavaScript errors and warnings in Cypress tests.
 * Provides methods to enable, disable, and check logger status.
 */

const envVarDisabled = 'JS_LOGGER_DISABLED';
const envVarCollector = '__JS_LOGGER_FAILURES__';
const envVarAllowedWarnings = '__JS_LOGGER_ALLOWED_WARNINGS__';
const envVarHookFlag = '__JS_LOGGER_HOOK_ATTACHED__';
const envVarStrategy = '__JS_LOGGER_STRATEGY__';

/**
 * Returns the current strategy for handling JavaScript errors and warnings in Cypress tests.
 * @returns  { 'failFast' | 'failAfterAll' | 'failAfterEach' } - The current strategy for handling JavaScript errors and warnings.
 * - 'failFast': Fail immediately when an error is detected.
 * - 'failAfterAll': Collect errors and warnings after all tests and fail at the end of the test suite.
 * - 'failAfterEach': Collect errors and warnings after each test and fail if any issues are found.
 */
const getStrategy = (): 'failFast' | 'failAfterAll' | 'failAfterEach' => {
    return Cypress.env(envVarStrategy) || 'failFast';
};

/**
 * Sets the strategy for handling JavaScript errors and warnings in Cypress tests.
 * @param strategy  { 'failFast' | 'failAfterAll' | 'failAfterEach' } - Strategy for handling JavaScript errors and warnings.
 * - 'failFast': Fail immediately when an error is detected.
 * - 'failAfterAll': Collect errors and warnings after all tests and fail at the end of the test suite.
 * - 'failAfterEach': Collect errors and warnings after each test and fail if any issues are found.
 * @throws {Error} If an invalid strategy is provided.
 * @returns {void}
 */
const setStrategy = (strategy: 'failFast' | 'failAfterAll' | 'failAfterEach'): void => {
    if (['failFast', 'failAfterAll', 'failAfterEach'].includes(strategy)) {
        Cypress.env(envVarStrategy, strategy);
    } else {
        throw new Error(`Invalid strategy: ${strategy}. Valid strategies are 'failFast', 'failAfterAll', and 'failAfterEach'.`);
    }
};

/**
 * Checks if the js errors and warnings logger is disabled.
 * @returns {boolean} - true if the logger is disabled, false otherwise.
 */
const isDisabled = (): boolean => { return Cypress.env(envVarDisabled) === true; }

/**
 * Sets the list of allowed warnings that will not be reported by the logger.
 * @param warnings {string[]} - Array of warning messages to be allowed.
 * @return {void}
 */
const setAllowedJsWarnings = (warnings: string[]): void => { Cypress.env(envVarAllowedWarnings, warnings); };

/**
 * Attaches custom hooks to Cypress events to monitor and report JavaScript errors and warnings.
 * This method is called automatically when the logger is enabled.
 * It sets up listeners for console errors and warnings, collects them after each test,
 * and throws an error if any issues are found after all tests are executed.
 */
const attachFailAfterAll = (): void => {
    // Skip hook attachment if the logger is disabled (e.g. from CI/CD pipeline)
    if (isDisabled()) { return; }

    // Prevent multiple hook attachments
    if (Cypress.env(envVarHookFlag) === true) { return; }
    // Set the flag to indicate that hooks are attached
    Cypress.env(envVarHookFlag, true);

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

        // Reset hook attachment flag
        Cypress.env('__JS_LOGGER_HOOKS_ATTACHED__', false);

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
};

const attachFailAfterEach = (): void => {
    // Skip hook attachment if the logger is disabled (e.g. from CI/CD pipeline)
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
};

const attachFailFast = (): void => {
    // Skip hook attachment if the logger is disabled (e.g. from CI/CD pipeline)
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
        console.log('DOM FULLY LOADED AND PARSED. LOOKING FOR JS ISSUES...');

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
};

const attachHooks = (): void => {
    switch (getStrategy()) {
        case 'failAfterAll':
            attachFailAfterAll();
            break;
        case 'failAfterEach':
            attachFailAfterEach();
            break;
        default:
            attachFailFast();
    }
};

/**
 * Exports the jsLogger module with methods to attach hooks, enable/disable logging, and set allowed warnings.
 */
export const jsErrorsLogger = {
    attachHooks,
    setAllowedJsWarnings,
    setStrategy
};
