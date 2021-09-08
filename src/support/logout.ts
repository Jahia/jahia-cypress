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

export const logout = (): void => {
    Cypress.log({
        name: 'logout',
        message: `Logout`,
        consoleProps: () => {
            return {}
        },
    })

    cy.request({
        method: 'POST',
        url: '/cms/logout',
        followRedirect: false,
        log: false
    }).then(res => {
        expect(res.status, 'Logout result').to.eq(302)
    })
}

