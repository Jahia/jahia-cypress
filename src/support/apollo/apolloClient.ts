import {ApolloClient, from, InMemoryCache, NormalizedCacheObject} from '@apollo/client/core';
import {formDataHttpLink, uploadLink} from './links';

interface AuthMethod {
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
            apolloClient(authMethod?: AuthMethod): Chainable<ApolloClient<NormalizedCacheObject>>
        }
    }
}

export type ApolloClientOptions = Cypress.Loggable & {
    setCurrentApolloClient: boolean
}

export const apolloClient = function (authMethod: AuthMethod = {url: Cypress.config().baseUrl}, options: ApolloClientOptions = {
    log: true,
    setCurrentApolloClient: true
}): void {
    const headers: { authorization?: string } = {};
    if (authMethod.token !== undefined) {
        headers.authorization = `APIToken ${authMethod.token}`;
    } else if (authMethod.username !== undefined && authMethod.password !== undefined) {
        headers.authorization = `Basic ${btoa(authMethod.username + ':' + authMethod.password)}`;
    } else {
        headers.authorization = `Basic ${btoa('root:' + Cypress.env('SUPER_USER_PASSWORD'))}`;
    }

    const links = [uploadLink, formDataHttpLink(authMethod.url, headers)];

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
                    Auth: authMethod,
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
