/// <reference types="cypress" />
import { ApolloClient, ApolloQueryResult, FetchResult, MutationOptions, QueryOptions } from '@apollo/client/core';
declare global {
    namespace Cypress {
        interface Chainable<Subject> {
            apollo(options: ApolloOptions): Chainable<ApolloQueryResult<any> | FetchResult>;
        }
    }
}
export declare type FileQueryOptions = Partial<QueryOptions> & {
    queryFile?: string;
};
export declare type FileMutationOptions = Partial<MutationOptions> & {
    mutationFile?: string;
};
export declare type ApolloOptions = (QueryOptions | MutationOptions | FileQueryOptions | FileMutationOptions) & Partial<Cypress.Loggable>;
export declare const apollo: (apollo: ApolloClient<any>, options: ApolloOptions) => void;
