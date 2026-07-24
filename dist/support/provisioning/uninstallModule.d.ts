declare global {
    namespace Cypress {
        interface Chainable<Subject> {
            uninstallModule(moduleSymbolicName: string): Chainable<Cypress.Response<any>>;
        }
    }
}
export declare const uninstallModule: (moduleSymbolicName: string) => void;
