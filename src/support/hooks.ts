/* eslint-disable brace-style */
/* eslint-disable max-statements-per-line */

const envVarHeadersInterceptorDisabled = 'HEADERS_INTERCEPTOR_DISABLED';
const envVarHeadersInterceptorFormat = '__HEADERS_INTERCEPTOR_FORMAT__';

// @private
let invalidHeaders: { [key: string]: string | string[]; } = {};

function isHeadersInterceptorDisabled(): boolean { return Cypress.env(envVarHeadersInterceptorDisabled) === true; }
function setHeadersInterceptorFormat(headers: { [key: string]: RegExp }): void { Cypress.env(envVarHeadersInterceptorFormat, headers); }
function getHeadersFormat(): { string: RegExp } { return Cypress.env(envVarHeadersInterceptorFormat) || {}; }

function attachHeadersInterceptor(): void {
    // Do not attach the interceptor if it is disabled
    if (isHeadersInterceptorDisabled()) { return; }

    // @note https://github.com/cypress-io/cypress/issues/26248 (Socket closed error)
    beforeEach(() => {
        invalidHeaders = {};
        // Get the URL from Cypress.config() to intercept all requests
        const baseUrl = Cypress.config('baseUrl') || '';
        // Use a wildcard to match all requests
        const urlPattern = baseUrl.endsWith('/') ? `${baseUrl}**/*` : `${baseUrl}/**/*`;
        // Intercept all requests and analyze the headers
        cy.intercept(urlPattern, req => {
            req.on('after:response', res => { analyzeHeaders(res?.headers); });
        }).as('intercepted-request');
    });

    afterEach(() => {
        // Throw an error if there are any invalid headers
        if (Object.keys(invalidHeaders).length > 0) {
            throw new Error('[ HEADERS INTERCEPTOR ] Invalid headers found. Check the logs for details.');
        }
    });
}

/**
 *
 * @param {{ [key: string]: string | string[]; }} headers
 * @private
 */
function analyzeHeaders(headers: { [key: string]: string | string[]; }): void {
    const formats = getHeadersFormat();

    // Iterate through response.headers,
    // if header matches the key from formats - validate it against the regex and log the result
    Object.keys(headers).forEach(headerName => {
        const value = headers[headerName];
        if (formats[headerName] && !formats[headerName].test(value)) {
            invalidHeaders[headerName] = value;
            Cypress.log({displayName: '[ INVALID HEADER ]', message: `${headerName}: ${value}`}).finish();
        }
    });
}

/**
 * Exports hooks and aux functions for Cypress tests.
 */
export const jahiaHooks = {
    attachHeadersInterceptor,
    setHeadersInterceptorFormat
};
