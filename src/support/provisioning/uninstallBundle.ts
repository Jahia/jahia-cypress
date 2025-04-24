/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */

// Load type definitions that come with Cypress module
/// <reference types="cypress" />

declare global {
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Chainable<Subject> {
            uninstallBundle(bundleSymbolicName: string): Chainable<Cypress.Response<any>>
        }
    }
}

export const uninstallBundle = function (bundleSymbolicName: string): void {
    cy.runProvisioningScript({
        script: {
            fileContent: '- uninstallModule: "' + bundleSymbolicName + '"\n',
            type: 'application/yaml'
        }
    });
};
