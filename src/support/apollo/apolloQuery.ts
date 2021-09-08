/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */

// Load type definitions that come with Cypress module
/// <reference types="cypress" />

import {ApolloClient, ApolloQueryResult, QueryOptions} from '@apollo/client/core'

declare global {
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Chainable<Subject> {
            apolloQuery(options: QueryOptions): Chainable<ApolloQueryResult<any>>
        }
    }
}

export const apolloQuery = function (apollo: ApolloClient<any>, options: QueryOptions & Cypress.Loggable): void {
    if (!apollo) {
        apollo = this.currentApolloClient
    }

    let result : ApolloQueryResult<any>
    let logger : Cypress.Log

    const {log = true, ...apolloOptions} = options
    if (!apollo) {
        cy.apolloClient().apolloQuery(apolloOptions)
    } else {
        if (log) {
            logger = Cypress.log({
                autoEnd: false,
                name: 'apolloQuery',
                displayName: 'apQuery',
                message: `Execute Graphql Query: ${options.query.loc.source.body}`,
                consoleProps: () => {
                    return {
                        Options: apolloOptions,
                        Yielded: result
                    }
                },
            })
        }

        cy.wrap({}, {log: false})
            .then(() => apollo.query(options))
            .then(r => {
                result = r
                logger?.end()
                return r
            })
    }
}
