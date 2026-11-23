/**
 * Logs out the Jahia session that a test leaves behind. See docs/session-cleanup.md.
 */

import {logoutRequest} from './logout';

const SESSION_COOKIE = 'JSESSIONID';

/** The session ids that `cy.session()` stored, which a later test restores. */
const keptSessionIds = new Set<string>();

/** The session ids to log out when the spec ends. */
const specEndSessionIds = new Set<string>();

/**
 * Tells whether the session of the cookie must be logged out.
 * @param {string | undefined} sessionId the value of the session cookie, if any
 * @param {ReadonlySet<string>} keptIds the session ids that a later test restores
 * @returns {boolean} true when there is a session that no later test restores
 */
export const shouldLogout = (sessionId: string | undefined, keptIds: ReadonlySet<string>): boolean => {
    return Boolean(sessionId) && !keptIds.has(sessionId);
};

/**
 * Tells whether the value of `JAHIA_LOGOUT_AFTER_TEST` leaves the hook on.
 * @param {unknown} value the value of the Cypress environment variable, a boolean or a string
 * @returns {boolean} false for `false` and for the string `'false'`, true otherwise
 */
export const isEnabled = (value: unknown): boolean => value !== false && String(value).toLowerCase() !== 'false';

const baseUrlHostname = (): string | undefined => {
    const baseUrl = Cypress.config('baseUrl');
    return baseUrl ? new URL(baseUrl).hostname : undefined;
};

const isActive = (): boolean => isEnabled(Cypress.env('JAHIA_LOGOUT_AFTER_TEST')) && Boolean(baseUrlHostname());

const withSessionId = (fn: (sessionId: string | undefined) => void): void => {
    cy.getCookie(SESSION_COOKIE, {domain: baseUrlHostname(), log: false}).then(cookie => fn(cookie?.value));
};

const logoutCurrentSession = (): void => {
    logoutRequest().then(response => {
        if (response.status >= 400) {
            Cypress.log({
                name: 'sessionCleanup',
                message: `The logout of the session that the test left answered ${response.status}`
            });
        }
    });
};

/**
 * Keeps the current session open after the test, because `cy.session()` restores it in a later test.
 * @param {boolean} acrossSpecs true when `cy.session()` also restores the session in a later spec
 */
export const keepCurrentSession = (acrossSpecs = false): void => {
    withSessionId(sessionId => {
        if (sessionId) {
            keptSessionIds.add(sessionId);
            if (!acrossSpecs) {
                specEndSessionIds.add(sessionId);
            }
        }
    });
};

/** Logs out the session of the test, unless `cy.session()` restores it later. */
export const afterTest = (): void => {
    if (!isActive()) {
        return;
    }

    withSessionId(sessionId => {
        if (!shouldLogout(sessionId, keptSessionIds)) {
            return;
        }

        if (Cypress.config('testIsolation') === false) {
            // The next test of the suite shares this session: log it out when the spec ends.
            specEndSessionIds.add(sessionId);
        } else {
            logoutCurrentSession();
        }
    });
};

/** Logs out the sessions that the tests of the spec shared, and the sessions that `cy.session()` stored for the spec only. */
export const afterSpec = (): void => {
    if (!isActive() || specEndSessionIds.size === 0) {
        return;
    }

    const domain = baseUrlHostname();
    specEndSessionIds.forEach(sessionId => {
        cy.setCookie(SESSION_COOKIE, sessionId, {domain, path: '/', log: false});
        logoutCurrentSession();
        keptSessionIds.delete(sessionId);
    });
    specEndSessionIds.clear();
    cy.clearCookie(SESSION_COOKIE, {domain, log: false});
};

/**
 * Replaces `cy.session()`: once the session is created or restored, keeps it, so the hooks do not log it out.
 * The arguments reach `cy.session()` unchanged, because Cypress compares the text of the setup.
 * @param {Function} originalFn the original `cy.session()` command
 * @param {string | object} id the id of the session
 * @param {Function} setup the setup of the session
 * @param {Cypress.SessionOptions} options the options of the session
 * @returns {Cypress.Chainable<null>} the chain of the original command
 */
export const sessionThatKeeps: Cypress.CommandFnWithOriginalFn<'session'> = (originalFn, id, setup, options) => {
    return originalFn(id, setup, options).then(subject => {
        keepCurrentSession(Boolean(options?.cacheAcrossSpecs));
        cy.wrap(subject, {log: false});
    });
};

/**
 * Registers the hooks that log out the session a test leaves behind, and marks each session that
 * `cy.session()` creates or restores, so that the hooks keep it while a later test can restore it.
 */
const enable = (): void => {
    Cypress.Commands.overwrite('session', sessionThatKeeps);

    afterEach(afterTest);
    after(afterSpec);
};

export const sessionCleanup = {enable};
