/// <reference types="cypress" />
declare global {
    namespace Cypress {
        interface Chainable<Subject> {
            login(username?: string, password?: string): Chainable<Cypress.Response<any>>;
            loginAndStoreSession(username?: string, password?: string): Chainable<Cypress.Response<any>>;
        }
    }
}
export declare const login: (username?: string, password?: string) => void;
export declare const loginAndStoreSession: (username?: string, password?: string) => void;
