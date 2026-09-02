
// Groovy script to be used for logging test suite and test case start/end markers
const loggerScript = 'groovy/logger.groovy';
const delimeters = {spec: '='.repeat(20), test: '-'.repeat(20)};

/**
 * Generates a marker for the beginning or end of a test suite.
 * @param action - The action being performed (e.g., "Starting" or "Ending").
 * @param name - The name of the test suite.
 * @returns A formatted string representing the suite marker.
 */
const specMarker = (action: string, name: string): string => `${delimeters.spec} ${action} ${name} ${delimeters.spec}`;

/**
 * Generates a marker for the beginning or end of a test.
 * @param action - The action being performed (e.g., "Starting" or "Ending").
 * @param title - The title of the test.
 * @returns A formatted string representing the test marker.
 */
const testMarker = (action: string, title: string): string => `${delimeters.test} ${action} ${title} ${delimeters.test}`;

/**
 * Runs `fn` on a disposable cookie jar, then restores the jar `fn` actually started with.
 *
 * `executeGroovy` authenticates with root's HTTP Basic credentials, but it's still a
 * `cy.request()` — Cypress attaches it to the browser's current cookies like any other request to
 * the app's origin. A servlet container commonly binds Basic-Auth to whatever session a request
 * already carries rather than opening an isolated one, so if the visitor's own session cookie
 * rides along, that session's identity gets mutated server-side to root. Reinstating the same
 * cookie *value* afterwards does not undo that — the server still recognizes that exact session id
 * as root's. Clearing the jar before `fn()` denies it any existing session to mutate, so it always
 * gets a fresh one of its own; clearing again after discards that one instead of leaving it behind
 * for the next command; restoring the original snapshot then returns exactly the session (or lack
 * of one) that was in place beforehand, including one a suite legitimately established earlier
 * (e.g. via `loginAndStoreSession`'s `cy.session()`).
 * @param {() => void} fn the action to run in isolation from the surrounding cookie jar
 */
const withPreservedCookies = (fn: () => void): void => {
    cy.getCookies({log: false}).then(cookies => {
        cy.clearCookies({log: false});
        fn();
        cy.clearCookies({log: false});
        cookies.forEach(cookie => {
            cy.setCookie(cookie.name, cookie.value, {
                path: cookie.path,
                domain: cookie.domain,
                secure: cookie.secure,
                httpOnly: cookie.httpOnly,
                sameSite: cookie.sameSite,
                log: false
            });
        });
    });
};

/**
 * Enables logging markers for the start and end of test suites and individual tests.
 * This function sets up hooks to log messages before and after each test and suite execution.
 * It uses a Groovy script to log the messages, which can be useful for tracking test execution in Jahia logs.
 */
const enableSpecsMarker = (): void => {
    before(() => {
        withPreservedCookies(() => cy.executeGroovy(loggerScript, {MESSAGE: specMarker('[BEGIN SPEC]', Cypress.spec.name)}));
    });

    beforeEach(function () {
        withPreservedCookies(() => cy.executeGroovy(loggerScript, {MESSAGE: testMarker('[BEGIN TEST]', this.currentTest!.title)}));
    });

    afterEach(function () {
        withPreservedCookies(() => cy.executeGroovy(loggerScript, {MESSAGE: testMarker('[END TEST]', this.currentTest!.title)}));
    });

    after(() => {
        withPreservedCookies(() => cy.executeGroovy(loggerScript, {MESSAGE: specMarker('[END SPEC]', Cypress.spec.name)}));
    });
};

export const jahiaLog = {enableSpecsMarker};
