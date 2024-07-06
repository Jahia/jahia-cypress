/// <reference types="cypress" />
declare global {
    namespace Cypress {
        interface Chainable<Subject> {
            uninstallBundle(bundleSymbolicName: string): Chainable<Cypress.Response<any>>;
        }
    }
}
export declare const uninstallBundle: (bundleSymbolicName: string) => void;
