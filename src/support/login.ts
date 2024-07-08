/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */

// Load type definitions that come with Cypress module
/// <reference types="cypress" />

declare global {
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Chainable<Subject> {
            login(username?: string, password?: string, url?: string): Chainable<Cypress.Response<any>>
            loginAndStoreSession(username?: string, password?: string, url?: string): Chainable<Cypress.Response<any>>
        }
    }
}

export const login = (username = 'root', password: string = Cypress.env('SUPER_USER_PASSWORD'), url = '/cms/login'): void => {
    Cypress.log({
        name: 'login',
        message: `Login with ${username}`,
        consoleProps: () => {
            return {
                User: username
            };
        }
    });

    cy.request({
        method: 'POST',
        form: true,
        body: {username, password},
        followRedirect: false,
        log: false,
        url
    }).then(res => {
        expect(res.status, 'Login result').to.eq(302);
    });
};

export const loginAndStoreSession = (username = 'root', password: string = Cypress.env('SUPER_USER_PASSWORD'), url = '/start'): void => {
    cy.session('session-' + username, () => {
        cy.login(username, password); // Edit in chief
    }, {
        validate() {
            cy.request(url).its('status').should('eq', 200);
        }
    });
};
