/// <reference types="cypress" />
declare global {
    namespace Cypress {
        interface Chainable<Subject> {
            logout(): Chainable<Cypress.Response<any>>;
        }
    }
}
export declare const logout: () => void;
