import '../../../src/support/apollo/apollo';
import '../../../src/support/apollo/apolloClient';
import {modSince} from '../../../src/support/modSince';
import {resolveJahiaRelease} from '../../../src/utils/JahiaPlatformHelper';

// The root before() of modSince runs against a GraphQL API that reports no release
modSince.enable();

Cypress.Commands.add('apolloClient', (() => {
    return cy.wrap({} as unknown);
}) as Cypress.CommandFn<'apolloClient'>);

Cypress.Commands.add('apollo', (() => {
    return cy.wrap({data: {admin: {jahia: {version: {}}}}});
}) as Cypress.CommandFn<'apollo'>);

describe('modSince when GraphQL reports no release', () => {
    let minimumRan = false;
    let upperBoundRan = false;

    it.since('8.0.0', 'never runs a test gated on a minimum', () => {
        minimumRan = true;
    });

    it.since('<99.0.0', 'never runs a test gated on an upper bound', () => {
        upperBoundRan = true;
    });

    it('caches no release', () => {
        expect(resolveJahiaRelease()).to.equal(undefined);
    });

    it('skips the gated tests', () => {
        expect(minimumRan).to.equal(false);
        expect(upperBoundRan).to.equal(false);
    });
});
