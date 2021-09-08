/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */

import {ApolloClient, FetchResult, MutationOptions} from '@apollo/client/core'

declare global {
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Chainable<Subject> {
            apolloMutate(options: MutationOptions): Chainable<FetchResult>
        }
    }
}

export const apolloMutate = function (apollo: ApolloClient<any>, options: MutationOptions & Cypress.Loggable): void {
    if (!apollo) {
        apollo = this.currentApolloClient
    }

    let result : FetchResult<any>
    let logger : Cypress.Log

    const {log = true, ...apolloOptions} = options
    if (!apollo) {
        cy.apolloClient().apolloMutate(apolloOptions)
    } else {
        if (log) {
            logger = Cypress.log({
                autoEnd: false,
                name: 'apolloQuery',
                displayName: 'apQuery',
                message: `Execute Graphql Mutation: ${options.mutation.loc.source.body}`,
                consoleProps: () => {
                    return {
                        Options: apolloOptions,
                        Yielded: result
                    }
                },
            })
        }

        cy.wrap({}, {log: false})
            .then(() => apollo.mutate(options))
            .then(r => {
                result = r
                logger.end()
                return r
            })
    }
}

