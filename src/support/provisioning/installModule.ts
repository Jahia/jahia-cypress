/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */

// Load type definitions that come with Cypress module
/// <reference types="cypress" />

declare global {
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Chainable<Subject> {
            installModule(moduleFile: string): Chainable<Cypress.Response<any>>;
            installAndStartModule(moduleFile: string): Chainable<Cypress.Response<any>>;
        }
    }
}

export const installModule = function (moduleFile: string): void {
    cy.runProvisioningScript({
        script: [{installModule: moduleFile}],
        files: [{
            fileName: moduleFile,
            type: 'text/plain'
        }]
    });
};

export const installAndStartModule = function (moduleFile: string): void {
    cy.runProvisioningScript({
        script: [{installAndStartModule: moduleFile}],
        files: [{
            fileName: moduleFile,
            type: 'text/plain'
        }]
    });
};
