/// <reference types="cypress" />
declare global {
    namespace Cypress {
        interface Chainable<Subject> {
            runProvisioningScript(script: FormFile | StringDictionary[], files?: FormFile[], jahiaServer?: JahiaServer): Chainable<any>;
        }
    }
}
export declare type StringDictionary = {
    [key: string]: string;
};
export declare type FormFile = {
    fileName?: string;
    fileContent?: string;
    type?: string;
    encoding?: Cypress.Encodings;
    replacements?: StringDictionary;
};
export declare type JahiaServer = {
    url: string;
    username: string;
    password: string;
};
export declare const runProvisioningScript: (script: FormFile | StringDictionary[], files?: FormFile[], jahiaServer?: JahiaServer, options?: Cypress.Loggable, timeout?: number) => void;
