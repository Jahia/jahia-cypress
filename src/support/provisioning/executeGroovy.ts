/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */

// Load type definitions that come with Cypress module
/// <reference types="cypress" />



declare global {
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Chainable<Subject> {
            executeGroovy(scriptFile: string, jahiaServer: JahiaServer, replacements?: { [key: string]: string }): Chainable<any>
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

export const executeGroovy = function (scriptFile: string, jahiaServer: JahiaServer = serverDefaults, replacements?: { [key: string]: string }): void {
    cy.runProvisioningScript({
        fileContent: '- executeScript: "' + scriptFile + '"',
        type: 'application/yaml'
    }, jahiaServer, [{
        fileName: scriptFile,
        replacements,
        type: 'text/plain'
    }]).then(r => r[0])
}