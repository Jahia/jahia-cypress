declare global {
    namespace Cypress {
        interface Chainable<Subject> {
            installConfig(configFile: string): Chainable<Cypress.Response<any>>;
        }
    }
}
export declare const installConfig: (configFile: string) => void;
