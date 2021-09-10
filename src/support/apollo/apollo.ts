/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */

// Load type definitions that come with Cypress module
/// <reference types="cypress" />

import {ApolloClient, ApolloQueryResult, FetchResult, MutationOptions, QueryOptions} from '@apollo/client/core'
import gql from "graphql-tag";

declare global {
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Chainable<Subject> {
            apollo(options: ApolloOptions): Chainable<ApolloQueryResult<any> | FetchResult>
        }
    }
}

type FileQueryOptions = Partial<QueryOptions> & { queryFile?: string }
type FileMutationOptions = Partial<MutationOptions> & { mutationFile?: string }
type ApolloOptions = (QueryOptions | MutationOptions | FileQueryOptions | FileMutationOptions) & Partial<Cypress.Loggable>;

function isQuery(options: ApolloOptions): options is QueryOptions {
    return (<QueryOptions>options).query !== undefined;
}

function isQueryFile(options: ApolloOptions): options is FileQueryOptions {
    return (<FileQueryOptions>options).queryFile !== undefined;
}

function isMutationFile(options: ApolloOptions): options is FileMutationOptions {
    return (<FileMutationOptions>options).mutationFile !== undefined;
}

export const apollo = function (apollo: ApolloClient<any>, options: ApolloOptions): void {
    if (!apollo) {
        apollo = this.currentApolloClient
    }

    let result : ApolloQueryResult<any> | FetchResult
    let logger : Cypress.Log

    if (!apollo) {
        cy.apolloClient().apollo(options)
    } else {
        if (isQueryFile(options)) {
            const {queryFile, ...apolloOptions} = options
            cy.fixture(queryFile).then(content => {
                cy.apollo({query: gql(content), ...apolloOptions})
            })
        } else if (isMutationFile(options)) {
            const {mutationFile, ...apolloOptions} = options
            cy.fixture(mutationFile).then(content => {
                cy.apollo({mutation: gql(content), ...apolloOptions})
            })
        } else {
            const {log = true, ...apolloOptions} = options
            if (log) {
                logger = Cypress.log({
                    autoEnd: false,
                    name: 'apollo',
                    displayName: 'apollo',
                    message: isQuery(apolloOptions) ? `Execute Graphql Query: ${apolloOptions.query.loc.source.body}` : `Execute Graphql Mutation: ${apolloOptions.mutation.loc.source.body}`,
                    consoleProps: () => {
                        return {
                            Options: apolloOptions,
                            Yielded: result
                        }
                    },
                })
            }

            cy.wrap({}, {log: false})
                .then(() => (isQuery(options) ? apollo.query(options) : apollo.mutate(options))
                    .then(r => {
                        result = r
                        logger?.end()
                        return r
                    })
                )
        }
    }
}
