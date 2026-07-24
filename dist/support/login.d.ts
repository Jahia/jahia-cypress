declare global {
    namespace Cypress {
        interface Chainable<Subject> {
            login(username?: string, password?: string, config?: string | {
                url?: string;
                rememberMe?: boolean;
            }): Chainable<Cypress.Response<any>>;
            loginAndStoreSession(username?: string, password?: string, url?: string): Chainable<Cypress.Response<any>>;
        }
    }
}
export declare const login: (username: string, password: string, config: string | {
    url?: string;
    rememberMe?: boolean;
}) => void;
export declare const loginAndStoreSession: (username?: string, password?: string, url?: string) => void;
