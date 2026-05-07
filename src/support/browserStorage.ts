/* eslint-disable @typescript-eslint/no-namespace */

/*
 * Contains helpers for printing or clearing browser's storage and cookies.
 * These are intended for interactive debugging and log full values by design.
 * Use with caution in automated tests to avoid exposing sensitive data in logs.
 */

declare global {
    namespace Cypress {
        interface Chainable {
            logAllCookies(): Chainable<void>;
            logCookie(cookieName: string): Chainable<void>;
            clearCookiesByType(type?: 'session' | 'persistent'): Chainable<void>;
            simulateBrowserClose(): Chainable<void>;
            resetBrowserState(): Chainable<void>;
            logSessionStorage(): Chainable<void>;
            logLocalStorage(): Chainable<void>;
        }
    }
}

/**
 * Prints cookie details in a structured format for debugging.
 *
 * Note: This helper logs the full cookie value by design.
 * @param {Cypress.Cookie} cookie Cookie object returned by Cypress.
 * @returns {void}
 * @private
 */
const printCookieValues = (cookie: Cypress.Cookie): void => {
    const cookieType = cookie.expiry ? 'Persistent' : 'Session';
    const expiryDate = cookie.expiry ? new Date(cookie.expiry * 1000).toISOString() : 'Session only';
    const daysUntilExpiry = cookie.expiry ? Math.round(((cookie.expiry * 1000) - Date.now()) / 1000 / 60 / 60 / 24) : null;

    cy.log('-'.repeat(60));
    cy.log(`Cookie: ${cookie.name}`);
    cy.log('-'.repeat(60));
    cy.log(`Type:       ${cookieType}`);
    cy.log(`Value:      ${cookie.value}`);
    cy.log(`Domain:     ${cookie.domain}`);
    cy.log(`Path:       ${cookie.path}`);
    cy.log(`Secure:     ${cookie.secure ? '✔ Yes' : '✘ No'}`);
    cy.log(`HttpOnly:   ${cookie.httpOnly ? '✔ Yes' : '✘ No'}`);
    cy.log(`SameSite:   ${cookie.sameSite || '(not set)'}`);

    if (cookie.expiry) {
        cy.log(`Expires:    ${expiryDate}`);
        cy.log(`Days left:  ${daysUntilExpiry} days`);
        cy.log(`Unix time:  ${cookie.expiry}`);
    } else {
        cy.log('Expires:    When browser closes (session cookie)');
    }
};

/**
 * Logs all available cookies with metadata and values.
 *
 * Intended for interactive debugging when full cookie visibility is needed.
 * @returns {Cypress.Chainable<void>} Cypress chainable resolved when logging is complete.
 */
const logAllCookies = (): Cypress.Chainable<void> => {
    return cy.getCookies().then(cookies => {
        if (cookies.length === 0) {
            cy.log('No cookies found');
            return;
        }

        cy.step(`COOKIES REPORT - Total: ${cookies.length}`, () => {
            cy.log('\n' + '='.repeat(60));
            cy.log(`COOKIES REPORT - Total: ${cookies.length}`);
            cy.log('='.repeat(60));

            const sessionCookies = cookies.filter(c => !c.expiry);
            const persistentCookies = cookies.filter(c => Boolean(c.expiry));

            cy.log(`📊 Session Cookies: ${sessionCookies.length}`);
            cy.log(`📊 Persistent Cookies: ${persistentCookies.length}`);

            cookies.forEach(cookie => {
                printCookieValues(cookie);
            });
        });
    }).then(() => undefined);
};

/**
 * Logs a specific cookie by name in a detailed format.
 *
 * Intended for interactive debugging when full cookie visibility is needed.
 * @param {string} cookieName Name of the cookie to read and print.
 * @returns {Cypress.Chainable<void>} Cypress chainable resolved when logging is complete.
 */
const logCookie = (cookieName: string): Cypress.Chainable<void> => {
    return cy.getCookie(cookieName).then(cookie => {
        if (!cookie) {
            cy.log(`Cookie "${cookieName}" not found`);
            return;
        }

        printCookieValues(cookie);
    }).then(() => undefined);
};

/**
 * Clears cookies based on their persistence type.
 * @param {'session'|'persistent'} [type='session'] Cookie category to clear.
 * @returns {Cypress.Chainable<void>} Cypress chainable resolved when clearing is complete.
 */
const clearCookiesByType = (type: 'session' | 'persistent' = 'session'): Cypress.Chainable<void> => {
    return cy.getCookies().then(cookies => {
        const cookiesToClear = cookies.filter(cookie => (type === 'session' ? !cookie.expiry : Boolean(cookie.expiry)));

        cy.log(`🗑️  Clearing ${cookiesToClear.length} ${type} cookie(s):`);
        cookiesToClear.forEach(cookie => {
            const info = cookie.expiry ? `expires ${new Date(cookie.expiry * 1000).toISOString()}` : 'session only';
            cy.log(`  - ${cookie.name} (${info})`);
            cy.clearCookie(cookie.name);
        });

        cy.log(`Cleared ${cookiesToClear.length} ${type} cookie(s)`);
    }).then(() => undefined);
};

/**
 * Simulates a browser close by clearing session storage and cookies.
 * Persistent cookies are kept intentionally.
 * @returns {void}
 */
const simulateBrowserClose = (): void => {
    cy.log('Simulating browser close...');

    // Clear session storage
    cy.clearAllSessionStorage();

    // Clear session cookies only
    clearCookiesByType('session');

    cy.log('Browser close simulated (session storage and cookies are cleared)');
};

/**
 * Resets browser state by clearing all storages and all cookies.
 * Use this when a test needs a fully clean client-side state.
 * @returns {void}
 */
const resetBrowserState = (): void => {
    cy.log('Reset browser state...');

    // Clear all storage
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();

    // Clear all cookies
    cy.clearAllCookies();

    cy.log('Browser reset is done (all storages and cookies cleared)');
};

/**
 * Logs all sessionStorage entries grouped by origin.
 * Intended for interactive debugging and logs full values.
 * @returns {Cypress.Chainable<void>} Cypress chainable resolved when logging is complete.
 */
const logSessionStorage = (): Cypress.Chainable<void> => {
    return cy.getAllSessionStorage().then(session => {
        cy.log(`sessionStorage: ${JSON.stringify(session)}`);
    }).then(() => undefined);
};

/**
 * Logs all localStorage entries grouped by origin.
 * Intended for interactive debugging and logs full values.
 * @returns {Cypress.Chainable<void>} Cypress chainable resolved when logging is complete.
 */
const logLocalStorage = (): Cypress.Chainable<void> => {
    return cy.getAllLocalStorage().then(local => {
        cy.log(`localStorage: ${JSON.stringify(local)}`);
    }).then(() => undefined);
};

export {
    logAllCookies,
    logCookie,
    clearCookiesByType,
    simulateBrowserClose,
    resetBrowserState,
    logSessionStorage,
    logLocalStorage
};
