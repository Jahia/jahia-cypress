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
declare enum STRATEGY {
    failAfterEach = 0,
    failAfterAll = 1
}
/**
 * Returns the current strategy for handling JavaScript errors and warnings in Cypress tests.
 * @returns {STRATEGY} - The current strategy for handling JavaScript errors and warnings.
 * @note be careful with Cypress.env(envVarStrategy), since it might return `0` for `failAfterEach` strategy,
 *       which is falsy in JavaScript, so we need to check if the variable is undefined.
 */
declare function getStrategy(): STRATEGY;
/**
 * Sets the strategy for handling JavaScript errors and warnings in Cypress tests.
 * @param {STRATEGY} strategy - Strategy for handling JavaScript errors and warnings.
 * @throws {Error} If an invalid strategy is provided.
 * @returns {void}
 */
declare function setStrategy(strategy: STRATEGY): void;
/**
 * Returns the list of allowed warnings that will not be reported by the logger.
 * @returns {string[]} - Array of allowed warning messages.
 */
declare function getAllowedJsWarnings(): string[];
/**
 * Sets the list of allowed warnings that will not be reported by the logger.
 * @param warnings {string[]} - Array of warning messages to be allowed.
 * @return {void}
 */
declare function setAllowedJsWarnings(warnings: string[]): void;
/**
 * Disables the js errors and warnings logger.
 * @returns {void}
 */
declare function disable(): void;
/**
 * Attaches custom hooks to Cypress events to monitor and report JavaScript errors and warnings.
 * It sets up listeners for console errors and warnings, collects them for each visited URL in each test,
 * and throws an error if any issues are found after each or all tests are executed (depending on the strategy chosen).
 */
declare function enable(): void;
/**
 * Exports the jsLogger module with methods to attach hooks, enable/disable logging, and set allowed warnings.
 */
export declare const jsErrorsLogger: {
    setAllowedJsWarnings: typeof setAllowedJsWarnings;
    getAllowedJsWarnings: typeof getAllowedJsWarnings;
    setStrategy: typeof setStrategy;
    getStrategy: typeof getStrategy;
    enable: typeof enable;
    disable: typeof disable;
    STRATEGY: typeof STRATEGY;
};
export {};
