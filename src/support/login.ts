/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */

// Load type definitions that come with Cypress module
/// <reference types="cypress" />

declare global {
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Chainable<Subject> {
            login(username?: string, password?: string, config?: string| {url?: string; rememberMe?: boolean}): Chainable<Cypress.Response<any>>
            loginAndStoreSession(username?: string, password?: string, url?: string): Chainable<Cypress.Response<any>>
        }
    }
}
// Disable linter to keep as this for backward compatibility
// eslint-disable-next-line default-param-last
export const login = (username = 'root', password: string = Cypress.env('SUPER_USER_PASSWORD'), config: string | { url?: string, rememberMe?: boolean }): void => {
    Cypress.log({
        name: 'login',
        message: `Login with ${username}`,
        consoleProps: () => {
            return {
                User: username
            };
        }
    });
    const body: {username: string, password: string, useCookie?: string} = {username, password};
    let url = '/cms/login';
    if (typeof config === 'object') {
        if (config.rememberMe) {
            body.useCookie = 'on';
        }

        url = config.url ?? url;
    } else {
        url = config ?? url;
    }

    cy.request({
        method: 'POST',
        form: true,
        body,
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
