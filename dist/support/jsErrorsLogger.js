"use strict";
/* eslint-disable brace-style */
/* eslint-disable max-statements-per-line */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsErrorsLogger = void 0;
/**
 * Module for monitoring and reporting JavaScript errors and warnings in Cypress tests.
 * Provides methods to enable, disable, and check logger status.
 */
var envVarDisableAll = 'JAHIA_HOOKS_DISABLE';
var envVarDisableJsLogger = 'JAHIA_HOOKS_DISABLE_JS_LOGGER';
var envVarCollector = '__JS_LOGGER_FAILURES__';
var envVarAllowedWarnings = '__JS_LOGGER_ALLOWED_WARNINGS__';
var envVarStrategy = '__JS_LOGGER_STRATEGY__';
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
var STRATEGY;
(function (STRATEGY) {
    STRATEGY[STRATEGY["failAfterEach"] = 0] = "failAfterEach";
    STRATEGY[STRATEGY["failAfterAll"] = 1] = "failAfterAll";
})(STRATEGY || (STRATEGY = {}));
/**
 * Returns an emoji based on the type of message.
 * @param {string} type
 */
function getEmoji(type) {
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
function getStrategy() {
    return typeof Cypress.env(envVarStrategy) === 'undefined' ? STRATEGY.failAfterAll : Cypress.env(envVarStrategy);
}
/**
 * Sets the strategy for handling JavaScript errors and warnings in Cypress tests.
 * @param {STRATEGY} strategy - Strategy for handling JavaScript errors and warnings.
 * @throws {Error} If an invalid strategy is provided.
 * @returns {void}
 */
function setStrategy(strategy) { Cypress.env(envVarStrategy, strategy); }
/**
 * Returns console issues collected during the test execution.
 * @returns {CollectorItem []} - Array of collected issues, each issue is an object with test title and errors.
 */
function getCollectedIssues() { return Cypress.env(envVarCollector) || []; }
/**
 * Sets the console issues collected during the test execution.
 * @returns {void}
 */
function setCollectedIssues(items) { Cypress.env(envVarCollector, items); }
/**
 * Checks if the js errors and warnings logger is disabled.
 * @returns {boolean} - true if the logger is disabled, false otherwise.
 */
function isDisabled() { return ((Cypress.env(envVarDisableAll) === true) || (Cypress.env(envVarDisableJsLogger) === true)); }
/**
 * Returns the list of allowed warnings that will not be reported by the logger.
 * @returns {string[]} - Array of allowed warning messages.
 */
function getAllowedJsWarnings() { return Cypress.env(envVarAllowedWarnings) || []; }
/**
 * Sets the list of allowed warnings that will not be reported by the logger.
 * @param warnings {string[]} - Array of warning messages to be allowed.
 * @return {void}
 */
function setAllowedJsWarnings(warnings) { Cypress.env(envVarAllowedWarnings, warnings); }
/**
 * Attaches a custom JavaScript interceptor to capture console errors and warnings.
 */
function attachJsInterceptor() {
    /**
     * Custom 'window:before:load' hook to attach interceptors before the page is loaded and spy on console messages.
     */
    cy.on('window:before:load', function (window) {
        // Skip 'window:before:load' hook if the logger is disabled
        if (isDisabled()) {
            return;
        }
        // Spy on console.error and console.warn methods to capture errors and warnings
        cy.spy(window.console, 'error').as('errors');
        cy.spy(window.console, 'warn').as('warnings');
    });
    /**
     * Custom 'window:load' hook to collect JavaScript errors and warnings right after the page is loaded.
     */
    cy.on('window:load', function (win) {
        // Skip 'window:load' hook if the logger is disabled
        if (isDisabled()) {
            return;
        }
        // Collect errors and warnings after the page is fully loaded
        collectIssues(win);
    });
}
/**
 * Collects JavaScript errors and warnings using the spies set up in attachJsInterceptor.
 * @returns {Cypress.Chainable} - Cypress chainable object that resolves when issues are collected.
 */
function collectIssues(win) {
    var consoleIssues = [];
    // Look for console errors and warnings, collected by the spies
    return cy.get('@errors')
        .invoke('getCalls')
        .then(function (errorCalls) {
        // All errors should be collected
        consoleIssues = errorCalls.flatMap(function (call) { return call.args.map(function (arg) { return ({ type: 'error', msg: String(arg) }); }); });
    })
        .then(function () {
        // Analyze warnings - return the chain to maintain proper async flow
        return cy.get('@warnings')
            .invoke('getCalls')
            .then(function (warningCalls) {
            var allowedWarnings = getAllowedJsWarnings();
            warningCalls.flatMap(function (call) { return call.args; }).forEach(function (arg) {
                // Only warnings not in the allowed list should be collected
                if (!allowedWarnings.some(function (item) { return arg.includes(item); })) {
                    consoleIssues.push({ type: 'warn', msg: String(arg) });
                }
            });
        });
    })
        .then(function () {
        // Update the Cypress environment variable with the collected issues
        if (consoleIssues.length > 0) {
            setCollectedIssues(__spreadArray(__spreadArray([], getCollectedIssues(), true), [
                { url: win.location.href, test: Cypress.currentTest.title, errors: consoleIssues }
            ], false));
        }
    });
}
/**
 * Analyzes collected JavaScript errors and warnings and throws an error if any were found.
 */
function analyzeIssues() {
    return cy.wrap(getCollectedIssues()).then(function (failures) {
        if (failures.length > 0) {
            // Group all issues by test title
            var groupedByTest = failures.reduce(function (acc, failure) {
                acc[failure.test] = acc[failure.test] || [];
                acc[failure.test].push(failure);
                return acc;
            }, {});
            // Format the error message for each test with its collected issues
            var errorMessage = Object.entries(groupedByTest).map(function (_a) {
                var test = _a[0], items = _a[1];
                var urlsAndErrors = items.map(function (item) {
                    return "URL: ".concat(item.url, "\nISSUES:\n").concat(item.errors.map(function (e) { return "- ".concat(e.type === 'warn' ? getEmoji('warn') : getEmoji('error'), " ").concat(e.msg); }).join('\n'));
                }).join('\n\n');
                // Return the formatted message for the test;
                // Intentionally use fixed-width (50 chars) separators for better readability,
                // when the message might be wrapped
                return "".concat(getEmoji('error'), "\uFE0F TEST: ").concat(test.trim(), " ").concat(getEmoji('error'), "\uFE0F\n").concat('-'.repeat(50), "\n").concat(urlsAndErrors, "\n").concat('='.repeat(50));
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
function disable() { Cypress.env(envVarDisableJsLogger, true); }
/**
 * Attaches custom hooks to Cypress events to monitor and report JavaScript errors and warnings.
 * It sets up listeners for console errors and warnings, collects them for each visited URL in each test,
 * and throws an error if any issues are found after each or all tests are executed (depending on the strategy chosen).
 */
function enable() {
    // Ensure the logger is enabled
    Cypress.env(envVarDisableJsLogger, false);
    /**
     * Attach Cypress hooks for console messages collecting before EACH test execution.
     * Use 'beforeEach' hook and local (cy) context instead of global (Cypress) one
     * to ensure proper async flow and avoid events and hooks flakiness.
     */
    beforeEach(function () {
        attachJsInterceptor();
    });
    /**
     * Custom 'afterEach' hook to analyze JavaScript errors and warnings after EACH test execution.
     */
    afterEach(function () {
        // Skip the hook if the logger is disabled or if the strategy is not failAfterEach
        if (isDisabled() || (getStrategy() !== STRATEGY.failAfterEach)) {
            return;
        }
        // Analyze collected errors and warnings
        analyzeIssues();
    });
    /**
     * Custom 'after' hook to analyze JavaScript errors and warnings after ALL tests execution.
     */
    after(function () {
        // Skip the hook if the logger is disabled or if the strategy is not failAfterAll
        if (isDisabled() || (getStrategy() !== STRATEGY.failAfterAll)) {
            return;
        }
        // Analyze collected errors and warnings
        analyzeIssues();
    });
}
/**
 * Exports the jsLogger module with methods to attach hooks, enable/disable logging, and set allowed warnings.
 */
exports.jsErrorsLogger = {
    setAllowedJsWarnings: setAllowedJsWarnings,
    getAllowedJsWarnings: getAllowedJsWarnings,
    setStrategy: setStrategy,
    getStrategy: getStrategy,
    enable: enable,
    disable: disable,
    STRATEGY: STRATEGY
};
