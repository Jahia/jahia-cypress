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
};

export const executeGroovy = function (scriptFile: string, replacements?: { [key: string]: string }, jahiaServer: JahiaServer = serverDefaults): void {
    let result: any;
    let duration: number;
    const startTime = Date.now();

    const logger = Cypress.log({
        autoEnd: false,
        name: 'executeGroovy',
        displayName: 'groovy',
        message: scriptFile,
        consoleProps: () => ({
            Script: scriptFile,
            Replacements: replacements ?? {},
            Server: jahiaServer.url,
            Duration: duration === undefined ? 'pending' : `${duration}ms`,
            Result: result
        })
    });

    cy.runProvisioningScript({
        script: {
            fileContent: '- executeScript: "' + scriptFile + '"',
            type: 'application/yaml'
        },
        files: [{
            fileName: scriptFile,
            replacements,
            type: 'text/plain',
            encoding: 'utf-8'
        }],
        jahiaServer,
        options: {log: false}
    }).then(r => {
        result = (r as any)?.[0];
        duration = Date.now() - startTime;
        logger?.end();
        return result;
    });
};
