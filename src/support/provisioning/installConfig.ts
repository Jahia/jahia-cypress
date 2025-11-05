/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */

// Load type definitions that come with Cypress module
/// <reference types="cypress" />

declare global {
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Chainable<Subject> {
            installConfig(configFile: string): Chainable<Cypress.Response<any>>;
        }
    }
}

export const installConfig = function (configFile: string): void {
    cy.runProvisioningScript({
        script: {fileContent: `- installConfiguration: "${configFile}"`, type: 'application/yaml'},
        files: [{
            fileName: `${configFile}`,
            type: 'text/plain'
        }]
    });
};
