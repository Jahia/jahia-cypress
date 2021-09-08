/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */

// Load type definitions that come with Cypress module
/// <reference types="cypress" />



declare global {
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Chainable<Subject> {
            installBundle(bundleFile: string): Chainable<Cypress.Response<any>>
        }
    }
}

export const installBundle = function (bundleFile: string): void {
    cy.runProvisioningScript({
        fileContent: '- installBundle: "' + bundleFile + '"',
        type: 'application/yaml'
    }, [{
        fileName: bundleFile,
        type: 'text/plain'
    }])
}