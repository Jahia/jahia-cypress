import RequestOptions = Cypress.RequestOptions;
declare global {
    namespace Cypress {
        interface Chainable<Subject> {
            runProvisioningScript(params: RunProvisioningScriptParams): Chainable<unknown>;
        }
    }
}
export interface RunProvisioningScriptParams {
    script: FormFile | StringDictionary[];
    files?: FormFile[];
    /** Optional, defaults to serverDefaults */
    jahiaServer?: JahiaServer;
    options?: Cypress.Loggable;
    requestOptions?: Partial<RequestOptions>;
}
export type StringDictionary = {
    [key: string]: string;
};
export type FormFile = {
    fileName?: string;
    fileContent?: string;
    type?: string;
    encoding?: Cypress.Encodings;
    replacements?: StringDictionary;
};
export type JahiaServer = {
    url: string;
    username: string;
    password: string;
};
export declare const runProvisioningScript: (paramsOrScript: RunProvisioningScriptParams | FormFile | StringDictionary[], ...rest: any[]) => void;
