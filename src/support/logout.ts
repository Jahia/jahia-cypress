/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */

// Load type definitions that come with Cypress module
/// <reference types="cypress" />

declare global {
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Chainable<Subject> {
            logout(): Chainable<Cypress.Response<any>>
        }
    }
}

/**
 * Sends the logout request of the current session, and fails on no status.
 * @returns {Cypress.Chainable<Cypress.Response<any>>} the response of Jahia
 */
export const logoutRequest = (): Cypress.Chainable<Cypress.Response<any>> => {
    return cy.request({
        method: 'POST',
        url: '/cms/logout',
        followRedirect: false,
        failOnStatusCode: false,
        log: false
    });
};

export const logout = (): void => {
    Cypress.log({
        name: 'logout',
        message: 'Logout',
        consoleProps: () => {
            return {};
        }
    });

    logoutRequest().then(res => {
        expect(res.status, 'Logout result').to.eq(302);
    });
};

