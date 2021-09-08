/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */

// Load type definitions that come with Cypress module
/// <reference types="cypress" />



declare global {
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Chainable<Subject> {
            executeGroovy(scriptFile: string): Chainable<any>
        }
    }
}

export const executeGroovy = function (scriptFile: string): void {
    cy.runProvisioningScript({
        fileContent: '- executeScript: "' + scriptFile + '"',
        type: 'application/yaml'
    }, [{
        fileName: scriptFile,
        type: 'text/plain'
    }]).then(r => r[0])
}