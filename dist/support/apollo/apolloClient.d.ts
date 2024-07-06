/// <reference types="cypress" />
import { ApolloClient, NormalizedCacheObject } from '@apollo/client/core';
interface AuthMethod {
    token?: string;
    username?: string;
    password?: string;
    url?: string;
}
declare global {
    namespace Cypress {
        interface Chainable<Subject> {
            apolloClient(authMethod?: AuthMethod): Chainable<ApolloClient<NormalizedCacheObject>>;
        }
    }
}
export declare type ApolloClientOptions = Cypress.Loggable & {
    setCurrentApolloClient: boolean;
};
export declare const apolloClient: (authMethod?: AuthMethod, options?: ApolloClientOptions) => void;
export {};
