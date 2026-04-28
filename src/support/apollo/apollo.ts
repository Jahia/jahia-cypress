/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */

// Load type definitions that come with Cypress module
/// <reference types="cypress" />

import {ApolloClient, ApolloQueryResult, FetchResult, MutationOptions, QueryOptions} from '@apollo/client/core';
import {DocumentNode} from '@apollo/client/core';
import gql from 'graphql-tag';
import {FieldNode, getOperationAST, print} from 'graphql';

declare global {
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Chainable<Subject> {
            apollo(options: ApolloOptions): Chainable<ApolloQueryResult<any> | FetchResult>
        }
    }
}

export type FileQueryOptions = Partial<QueryOptions> & { queryFile?: string }
export type FileMutationOptions = Partial<MutationOptions> & { mutationFile?: string }
export type ApolloOptions = (QueryOptions | MutationOptions | FileQueryOptions | FileMutationOptions) & Partial<Cypress.Loggable>;

function isQuery(options: ApolloOptions): options is QueryOptions {
    return (<QueryOptions>options).query !== undefined;
}

function isQueryFile(options: ApolloOptions): options is FileQueryOptions {
    return (<FileQueryOptions>options).queryFile !== undefined;
}

function isMutationFile(options: ApolloOptions): options is FileMutationOptions {
    return (<FileMutationOptions>options).mutationFile !== undefined;
}

function getOperationLabel(doc: DocumentNode, opType: 'Query' | 'Mutation'): string {
    const opDef = getOperationAST(doc);
    if (opDef?.name?.value) {
        return `[${opType}] ${opDef.name.value}`;
    }

    // Anonymous operation: traverse up to 2 selection levels for a meaningful label
    const firstSel = opDef?.selectionSet?.selections?.[0];
    if (firstSel?.kind === 'Field') {
        const firstName = (firstSel as FieldNode).name.value;
        const secondSel = (firstSel as FieldNode).selectionSet?.selections?.[0];
        if (secondSel?.kind === 'Field') {
            return `[${opType}] ${firstName} › ${(secondSel as FieldNode).name.value}`;
        }

        return `[${opType}] ${firstName}`;
    }

    return `[${opType}]`;
}

function getQueryBody(doc: DocumentNode): string {
    return doc?.loc?.source?.body ?? print(doc);
}

// eslint-disable-next-line default-param-last, @typescript-eslint/no-shadow
export const apollo = function (apollo: ApolloClient<any> = this.currentApolloClient, options: ApolloOptions): void {
    let result : ApolloQueryResult<any> | FetchResult;
    let logger : Cypress.Log;
    let duration: number;
    const optionsWithDefaultCache: ApolloOptions = {fetchPolicy: 'no-cache', ...options};

    if (!apollo) {
        cy.apolloClient().apollo(optionsWithDefaultCache);
    } else if (isQueryFile(optionsWithDefaultCache)) {
        const {queryFile, ...apolloOptions} = optionsWithDefaultCache;
        cy.fixture(queryFile).then(content => {
            cy.apollo({query: gql(content), ...apolloOptions});
        });
    } else if (isMutationFile(optionsWithDefaultCache)) {
        const {mutationFile, ...apolloOptions} = optionsWithDefaultCache;
        cy.fixture(mutationFile).then(content => {
            cy.apollo({mutation: gql(content), ...apolloOptions});
        });
    } else {
        const {log = true, ...apolloOptions} = optionsWithDefaultCache;

        const doc = isQuery(apolloOptions) ?
            (apolloOptions as QueryOptions).query :
            (apolloOptions as MutationOptions).mutation;
        const opType = isQuery(apolloOptions) ? 'Query' : 'Mutation';
        const operationLabel = getOperationLabel(doc, opType);
        const queryBody = getQueryBody(doc);
        const variables = (apolloOptions as any).variables;
        const sourceLabel = (optionsWithDefaultCache as any)._sourceFile ? ` (${(optionsWithDefaultCache as any)._sourceFile})` : '';
        const variablesLabel = variables && Object.keys(variables).length > 0 ?
            ` — ${JSON.stringify(variables)}` :
            '';

        if (log) {
            logger = Cypress.log({
                autoEnd: false,
                name: 'apollo',
                displayName: 'apollo',
                message: `${operationLabel}${sourceLabel}${variablesLabel}`,
                consoleProps: () => {
                    const errors = (result as any)?.errors ?? (result as any)?.graphQLErrors ?? null;
                    const isCaughtError = result instanceof Error;
                    const hasErrors = (errors?.length > 0) || isCaughtError;
                    return {
                        Operation: operationLabel,
                        Variables: variables ?? {},
                        [`${opType} Body`]: queryBody,
                        Duration: duration === undefined ? 'pending' : `${duration}ms`,
                        Status: hasErrors ?
                            `error${isCaughtError ? `: ${(result as unknown as Error).message}` : ''}` :
                            'success',
                        Data: (result as any)?.data ?? null,
                        Errors: errors,
                        Yielded: result
                    };
                }
            });
        }

        const startTime = Date.now();
        cy.wrap({}, {log: false})
            .then(() => (isQuery(optionsWithDefaultCache) ? apollo.query(optionsWithDefaultCache).catch(error => {
                cy.log(`Caught GraphQL query error: ${(error as any)?.message ?? JSON.stringify(error)}`);
                return error;
            }) : apollo.mutate(optionsWithDefaultCache).catch(error => {
                cy.log(`Caught GraphQL mutation error: ${(error as any)?.message ?? JSON.stringify(error)}`);
                return error;
            }))
                .then(r => {
                    result = r;
                    duration = Date.now() - startTime;
                    if (logger) {
                        const errors = (r as any)?.errors ?? (r as any)?.graphQLErrors;
                        const hasErrors = (r instanceof Error) || (errors?.length > 0);
                        const prefix = hasErrors ? '❌ ' : '✅ ';
                        logger.set('message', `${prefix}${operationLabel}${sourceLabel}${variablesLabel}`);
                    }

                    logger?.end();
                    return r;
                })
            );
    }
};
