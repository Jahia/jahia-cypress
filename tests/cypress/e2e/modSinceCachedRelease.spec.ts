import '../../../src/support/apollo/apollo';
import '../../../src/support/apollo/apolloClient';
import {modSince} from '../../../src/support/modSince';
import {JAHIA_VERSION_ENV_VAR, resolveJahiaRelease} from '../../../src/utils/JahiaPlatformHelper';

// A release cached before the root before() of modSince runs
Cypress.env(JAHIA_VERSION_ENV_VAR, '9.9.9');
modSince.enable();

let graphqlCalls = 0;

Cypress.Commands.add('apolloClient', (() => {
    graphqlCalls++;
    return cy.wrap({} as unknown);
}) as Cypress.CommandFn<'apolloClient'>);

Cypress.Commands.add('apollo', (() => {
    graphqlCalls++;
    return cy.wrap({data: {admin: {jahia: {version: {release: '8.2.0'}}}}});
}) as Cypress.CommandFn<'apollo'>);

describe('modSince when a release is already cached', () => {
    it('keeps the cached release without querying GraphQL', () => {
        expect(resolveJahiaRelease()).to.equal('9.9.9');
        expect(graphqlCalls).to.equal(0);
    });
});
