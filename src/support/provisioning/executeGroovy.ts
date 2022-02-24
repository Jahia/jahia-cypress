/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */

// Load type definitions that come with Cypress module
/// <reference types="cypress" />



declare global {
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Chainable<Subject> {
            executeGroovy(scriptFile: string, replacements?: { [key: string]: string }, jahiaServer?: JahiaServer): Chainable<any>
        }
    }
}

type JahiaServer = {
    url: string;
    username: string;
    password: string
}

const serverDefaults = {
    url: Cypress.config().baseUrl,
    username: 'root',
    password: Cypress.env('SUPER_USER_PASSWORD')
}

export const executeGroovy = function (scriptFile: string, replacements?: { [key: string]: string }, jahiaServer: JahiaServer = serverDefaults): void {
    cy.runProvisioningScript({
        fileContent: '- executeScript: "' + scriptFile + '"',
        type: 'application/yaml'
    }, [{
        fileName: scriptFile,
        replacements,
        type: 'text/plain'
    }], jahiaServer).then(r => r[0])
}