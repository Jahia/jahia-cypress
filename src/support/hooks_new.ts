/* eslint-disable brace-style */
/* eslint-disable max-statements-per-line */

// Environment variables
const envVarDisabled = 'JAHIA_HOOKS_DISABLED';
const envVarCollector = '__JAHIA_HOOKS_FAILURES__';
const envVarStrategy = '__JAHIA_HOOKS_STRATEGY__';
const envVarHeadersInterceptorDisabled = 'HEADERS_INTERCEPTOR_DISABLED';
const envVarHeadersInterceptorFormat = '__HEADERS_INTERCEPTOR_FORMAT__';
const envVarJsLoggerDisabled = 'JS_LOGGER_DISABLED';
const envVarAllowedWarnings = '__JS_LOGGER_ALLOWED_WARNINGS__';

// const envVarHeadersInterceptorDisabled = 'HEADERS_INTERCEPTOR_DISABLED';
// const envVarHeadersInterceptorFormat = '__HEADERS_INTERCEPTOR_FORMAT__';

/**
 * Strategy for handling errors and issues in Cypress tests.
 * - failFast: Fail immediately when an issue is detected.
 * - failAfterEach: Collect all issues during test execution and fail if any issues are found.
 * - failAfterAll: Collect all issues after all tests and fail at the end of the test suite.
 */
enum STRATEGY { failFast, failAfterAll, failAfterEach }

/**
 * Types of issues that can be collected and reported.
 */
enum ISSUE_TYPE {
    HEADERS = 'HEADERS',
    JS_ERRORS = 'JS_ERRORS',
    JS_WARNINGS = 'JS_WARNINGS'
}

/**
 * Interface for collected issues.
 */
interface CollectedIssue {
    test: string;
    type: ISSUE_TYPE;
    issue: string;
}

/**
 * Returns the current strategy for handling issues in Cypress tests.
 * @returns {STRATEGY} - The current strategy for handling issues.
 */
function getStrategy(): STRATEGY {
    return typeof Cypress.env(envVarStrategy) === 'undefined' ? STRATEGY.failFast : Cypress.env(envVarStrategy);
}

/**
 * Sets the strategy for handling issues in Cypress tests.
 * @param {STRATEGY} strategy - Strategy for handling issues.
 * @returns {void}
 */
function setStrategy(strategy: STRATEGY): void { Cypress.env(envVarStrategy, strategy);}

/**
 * Checks if the Jahia hooks are disabled.
 * @returns {boolean} - true if the hooks are disabled, false otherwise.
 */
function isDisabled(): boolean { return Cypress.env(envVarDisabled) === true; }
function isHeadersInterceptorDisabled(): boolean { return Cypress.env(envVarHeadersInterceptorDisabled) === true; }
function setHeadersInterceptorFormat(headers: { [key: string]: RegExp }): void { Cypress.env(envVarHeadersInterceptorFormat, headers); }
function getHeadersFormat(): { string: RegExp } { return Cypress.env(envVarHeadersInterceptorFormat) || {}; }

function attachHeadersInterceptor(): void {
    // Do not attach the interceptor if it is disabled
    if (isHeadersInterceptorDisabled()) { return; }

    // @note https://github.com/cypress-io/cypress/issues/26248 (Socket closed error)
    beforeEach(() => {
        // Get the URL from Cypress.config() to intercept all requests
        const baseUrl = Cypress.config('baseUrl') || '';
        // Use a wildcard to match all requests
        const urlPattern = baseUrl.endsWith('/') ? `${baseUrl}**/*` : `${baseUrl}/**/*`;
        // Intercept all requests and analyze the headers
        cy.intercept(urlPattern, req => {
            req.on('after:response', res => { collectHeaders(res?.headers); });
        }).as('intercepted-request');
    });
}

function attachHeadersAnalyzer(): void {
    // Do not attach the interceptor if it is disabled
    if (isHeadersInterceptorDisabled()) { return; }

    afterEach(() => { formatAndReportIssues(); });
}

/**
 *
 * @param {{ [key: string]: string | string[]; }} headers
 * @private
 */
function collectHeaders(headers: { [key: string]: string | string[]; }): void {
    const formats = getHeadersFormat();

    // Iterate through response.headers,
    // if header matches the key from formats - validate it against the regex and log the result
    Object.keys(headers).forEach(headerName => {
        const value = headers[headerName];
        if (formats[headerName] && !formats[headerName].test(value)) {
            addIssueToCollector(ISSUE_TYPE.HEADERS, `${headerName}: ${value}`);
            Cypress.log({
                displayName: '[ INVALID RESPONSE HEADER ]',
                message: `${headerName}: ${value}`
            }).finish();
        }
    });

    // FAIL FAST STRATEGY
    if (getStrategy() === STRATEGY.failFast) { formatAndReportIssues(); }
}

/**
 * Adds an issue to the collector.
 * @param {ISSUE_TYPE} type - Type of the issue.
 * @param {string[]} issues - Array of issue messages.
 * @returns {void}
 */
function addIssueToCollector(type: ISSUE_TYPE, issue: string): void {
    const existingIssues = Cypress.env(envVarCollector) || [];
    const newIssue: CollectedIssue = {
        test: Cypress.currentTest.title,
        type,
        issue
    };

    Cypress.env(envVarCollector, [...existingIssues, newIssue]);
}

function formatAndReportIssues(): void {
    const issues: CollectedIssue[] = Cypress.env(envVarCollector) || [];
    if (issues.length === 0) {
        cy.log('[JAHIA HOOKS] No issues found.');
        return;
    }

    const groupedByTest = issues.reduce((acc, entity) => {
        if (!acc[entity.test]) {
            acc[entity.test] = {} as { [key in ISSUE_TYPE]: string[] };
        }

        if (!acc[entity.test][entity.type]) {
            acc[entity.test][entity.type] = [];
        }

        acc[entity.test][entity.type].push(entity.issue);
        return acc;
    }, {} as { [key: string]: { [key in ISSUE_TYPE]: string[] } });

    const sections = Object.keys(groupedByTest).map(test => {
        const header = `=== ${test} ===`;
        const content = Object.keys(groupedByTest[test]).map(type => {
            return `TYPE: ${type}\nISSUES:\n${groupedByTest[test][type as ISSUE_TYPE].map(e => `- ${e}`).join('\n')}`;
        }).join('\n\n');

        return `${header}\n${content}`;
    });

    throw new Error(`[JAHIA HOOKS] ISSUES FOUND:\n\n${sections.join('\n\n')}`);
}

function attach(): void {
    attachHeadersInterceptor();
    attachHeadersAnalyzer();
}

/**
 * Exports hooks and aux functions for Cypress tests.
 */
export const jahiaHooksNew = {
    attach,
    attachHeadersInterceptor,
    setHeadersInterceptorFormat
};
