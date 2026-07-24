declare global {
    namespace Cypress {
        interface Chainable<Subject> {
            installModule(moduleFile: string): Chainable<Cypress.Response<any>>;
            installAndStartModule(moduleFile: string): Chainable<Cypress.Response<any>>;
        }
    }
}
export declare const installModule: (moduleFile: string) => void;
export declare const installAndStartModule: (moduleFile: string) => void;
