/// <reference types="cypress" />
declare global {
    namespace Cypress {
        interface Chainable<Subject> {
            installBundle(bundleFile: string): Chainable<Cypress.Response<any>>;
        }
    }
}
export declare const installBundle: (bundleFile: string) => void;
