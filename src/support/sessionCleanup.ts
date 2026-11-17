/**
 * Logs out the Jahia session that a test leaves behind. See docs/session-cleanup.md.
 */

const SESSION_COOKIE = 'JSESSIONID';

/** The session ids that `loginAndStoreSession()` stored with `cy.session()`, which later tests restore. */
const storedSessionIds = new Set<string>();

/**
 * Tells whether the session of the cookie must be logged out.
 * @param {string | undefined} sessionId the value of the session cookie, if any
 * @param {ReadonlySet<string>} keptSessionIds the session ids that a later test restores
 * @returns {boolean} true when there is a session that no later test restores
 */
export const shouldLogout = (sessionId: string | undefined, keptSessionIds: ReadonlySet<string>): boolean => {
    return Boolean(sessionId) && !keptSessionIds.has(sessionId);
};

const isEnabled = (): boolean => Cypress.env('JAHIA_LOGOUT_AFTER_TEST') !== false;

const baseUrlHostname = (): string | undefined => {
    const baseUrl = Cypress.config().baseUrl;
    return baseUrl ? new URL(baseUrl).hostname : undefined;
};

/**
 * Keeps the current session open after the test, because `cy.session()` restores it in a later test.
 */
export const keepCurrentSession = (): void => {
    cy.getCookie(SESSION_COOKIE, {log: false}).then(cookie => {
        if (cookie) {
            storedSessionIds.add(cookie.value);
        }
    });
};

const logoutLeftSession = (): void => {
    const hostname = baseUrlHostname();
    if (!isEnabled() || !hostname) {
        return;
    }

    cy.getCookie(SESSION_COOKIE, {domain: hostname, log: false}).then(cookie => {
        if (shouldLogout(cookie?.value, storedSessionIds)) {
            cy.request({
                method: 'POST',
                url: '/cms/logout',
                followRedirect: false,
                failOnStatusCode: false,
                log: false
            });
        }
    });
};

/**
 * Registers the hooks that log out the session a test leaves behind. With `testIsolation`, the hook runs
 * after each test. Without it, the tests of a spec share their session, so the hook runs once after the spec.
 */
const enable = (): void => {
    afterEach(() => {
        if (Cypress.config('testIsolation') !== false) {
            logoutLeftSession();
        }
    });

    after(() => {
        if (Cypress.config('testIsolation') === false) {
            logoutLeftSession();
        }
    });
};

export const sessionCleanup = {enable};
