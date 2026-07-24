import { ApolloClient, NormalizedCacheObject } from '@apollo/client/core';
interface HostConfig {
    token?: string;
    username?: string;
    password?: string;
    url?: string;
}
declare global {
    namespace Cypress {
        interface Chainable<Subject> {
            apolloClient(config?: HostConfig): Chainable<ApolloClient<NormalizedCacheObject>>;
        }
    }
}
export type ApolloClientOptions = Cypress.Loggable & {
    setCurrentApolloClient: boolean;
};
export declare const switchApolloClient: (config?: HostConfig, options?: ApolloClientOptions) => void;
export declare const apolloClient: (config?: HostConfig, options?: ApolloClientOptions) => void;
export {};
