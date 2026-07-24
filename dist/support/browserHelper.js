"use strict";
/*
 * Contains helpers for printing or clearing browser's storage and cookies.
 * These are intended for interactive debugging and log full values by design.
 * Use with caution in automated tests to avoid exposing sensitive data in logs.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserHelper = void 0;
/**
 * Prints cookie details in a structured format for debugging.
 *
 * Note: This helper logs the full cookie value by design.
 * @param {Cypress.Cookie} cookie Cookie object returned by Cypress.
 * @returns {void}
 * @private
 */
var printCookieValues = function (cookie) {
    var cookieType = cookie.expiry ? 'Persistent' : 'Session';
    var expiryDate = cookie.expiry ? new Date(cookie.expiry * 1000).toISOString() : 'Session only';
    var daysUntilExpiry = cookie.expiry ? Math.round(((cookie.expiry * 1000) - Date.now()) / 1000 / 60 / 60 / 24) : null;
    cy.log('-'.repeat(60));
    cy.log("Cookie: ".concat(cookie.name));
    cy.log('-'.repeat(60));
    cy.log("Type:       ".concat(cookieType));
    cy.log("Value:      ".concat(cookie.value));
    cy.log("Domain:     ".concat(cookie.domain));
    cy.log("Path:       ".concat(cookie.path));
    cy.log("Secure:     ".concat(cookie.secure ? '✔ Yes' : '✘ No'));
    cy.log("HttpOnly:   ".concat(cookie.httpOnly ? '✔ Yes' : '✘ No'));
    cy.log("SameSite:   ".concat(cookie.sameSite || '(not set)'));
    if (cookie.expiry) {
        cy.log("Expires:    ".concat(expiryDate));
        cy.log("Days left:  ".concat(daysUntilExpiry, " days"));
        cy.log("Unix time:  ".concat(cookie.expiry));
    }
    else {
        cy.log('Expires:    When browser closes (session cookie)');
    }
};
/**
 * Clears cookies based on their persistence type.
 * @param {'session'|'persistent'} [type='session'] Cookie category to clear.
 * @returns {Cypress.Chainable<void>} Cypress chainable resolved when clearing is complete.
 */
var clearCookiesByType = function (type) {
    if (type === void 0) { type = 'session'; }
    return cy.getCookies().then(function (cookies) {
        var cookiesToClear = cookies.filter(function (cookie) { return (type === 'session' ? !cookie.expiry : Boolean(cookie.expiry)); });
        cy.step("\uD83D\uDDD1\uFE0F CLEAR ".concat(cookiesToClear.length, " ").concat(type, " cookie(s):"), function () {
            cookiesToClear.forEach(function (cookie) {
                var info = cookie.expiry ? "expires ".concat(new Date(cookie.expiry * 1000).toISOString()) : 'session only';
                cy.log(" ... clearing ".concat(cookie.name, " (").concat(info, ")"));
                cy.clearCookie(cookie.name);
            });
        });
    }).then(function () { return undefined; });
};
/**
 * Logs all available cookies with metadata and values.
 *
 * Intended for interactive debugging when full cookie visibility is needed.
 * @returns {Cypress.Chainable<void>} Cypress chainable resolved when logging is complete.
 */
var logCookies = function () {
    return cy.getCookies().then(function (cookies) {
        if (cookies.length === 0) {
            cy.log('No cookies found');
            return;
        }
        cy.step("COOKIES REPORT - Total: ".concat(cookies.length), function () {
            var sessionCookies = cookies.filter(function (c) { return !c.expiry; });
            var persistentCookies = cookies.filter(function (c) { return Boolean(c.expiry); });
            cy.log("Session Cookies: ".concat(sessionCookies.length));
            cy.log("Persistent Cookies: ".concat(persistentCookies.length));
            cookies.forEach(function (cookie) {
                printCookieValues(cookie);
            });
        });
    }).then(function () { return undefined; });
};
/**
 * Logs a specific cookie by name in a detailed format.
 *
 * Intended for interactive debugging when full cookie visibility is needed.
 * @param {string} cookieName Name of the cookie to read and print.
 * @returns {Cypress.Chainable<void>} Cypress chainable resolved when logging is complete.
 */
var logCookie = function (cookieName) {
    return cy.getCookie(cookieName).then(function (cookie) {
        if (!cookie) {
            cy.log("Cookie \"".concat(cookieName, "\" not found"));
            return;
        }
        printCookieValues(cookie);
    }).then(function () { return undefined; });
};
/**
 * Clears Session cookies
 * @returns {Cypress.Chainable<void>} Cypress chainable resolved when logging is complete.
 */
var clearSessionCookies = function () {
    return clearCookiesByType('session').then(function () { return undefined; });
};
/**
 * Clears Persistent cookies
 * @returns {Cypress.Chainable<void>} Cypress chainable resolved when logging is complete.
 */
var clearPersistentCookies = function () {
    return clearCookiesByType('persistent').then(function () { return undefined; });
};
/**
 * Simulates a browser close by clearing session storage and cookies.
 * Persistent cookies are kept intentionally.
 * @returns {void}
 */
var simulateClose = function () {
    cy.log('Simulating browser close...');
    // Clear session storage
    cy.clearAllSessionStorage();
    // Clear session cookies only
    clearSessionCookies();
    cy.log('Browser close simulated (session storage and cookies are cleared)');
};
/**
 * Resets browser state by clearing all storages and all cookies.
 * Use this when a test needs a fully clean client-side state.
 * @returns {void}
 */
var resetState = function () {
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
var logSessionStorage = function () {
    return cy.getAllSessionStorage().then(function (session) {
        cy.log("sessionStorage: ".concat(JSON.stringify(session)));
    }).then(function () { return undefined; });
};
/**
 * Logs all localStorage entries grouped by origin.
 * Intended for interactive debugging and logs full values.
 * @returns {Cypress.Chainable<void>} Cypress chainable resolved when logging is complete.
 */
var logLocalStorage = function () {
    return cy.getAllLocalStorage().then(function (local) {
        cy.log("localStorage: ".concat(JSON.stringify(local)));
    }).then(function () { return undefined; });
};
exports.BrowserHelper = {
    logCookies: logCookies,
    logCookie: logCookie,
    logSessionStorage: logSessionStorage,
    logLocalStorage: logLocalStorage,
    clearSessionCookies: clearSessionCookies,
    clearPersistentCookies: clearPersistentCookies,
    simulateClose: simulateClose,
    resetState: resetState
};
