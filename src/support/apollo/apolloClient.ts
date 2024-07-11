import {ApolloClient, from, InMemoryCache, NormalizedCacheObject} from '@apollo/client/core';
import {formDataHttpLink, uploadLink} from './links';

interface HostConfig {
    token?: string
    username?: string
    password?: string,
    url?: string
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Chainable<Subject> {
            apolloClient(config?: HostConfig): Chainable<ApolloClient<NormalizedCacheObject>>
        }
    }
}

export type ApolloClientOptions = Cypress.Loggable & {
    setCurrentApolloClient: boolean
}

export const switchApolloClient = function (config: HostConfig = {}, options: ApolloClientOptions = {
    log: true,
    setCurrentApolloClient: true
}): void {
    // Switch context to apollo client
    cy.visit(config.url || Cypress.config().baseUrl, {failOnStatusCode: false});
    return apolloClient(config, options);
};

export const apolloClient = function (config: HostConfig = {}, options: ApolloClientOptions = {
    log: true,
    setCurrentApolloClient: true
}): void {
    const headers: { authorization?: string } = {};
    if (config.token !== undefined) {
        headers.authorization = `APIToken ${config.token}`;
    } else if (config.username !== undefined && config.password !== undefined) {
        headers.authorization = `Basic ${btoa(config.username + ':' + config.password)}`;
    } else {
        headers.authorization = `Basic ${btoa('root:' + Cypress.env('SUPER_USER_PASSWORD'))}`;
    }

    const links = [uploadLink, formDataHttpLink(config.url || Cypress.config().baseUrl, headers)];

    const client = new ApolloClient({
        link: from(links),
        cache: new InMemoryCache(),
        defaultOptions: {
            query: {
                fetchPolicy: 'no-cache'
            }
        }
    });

    if (options.log) {
        Cypress.log({
            name: 'apolloClient',
            displayName: 'apClient',
            message: 'Create new apollo client',
            consoleProps: () => {
                return {
                    Config: config,
                    Yielded: client
                };
            }
        });
    }

    if (options.setCurrentApolloClient) {
        cy.wrap(client, {log: false}).as('currentApolloClient');
    } else {
        cy.wrap(client, {log: false});
    }
};
