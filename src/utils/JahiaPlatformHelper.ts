export const getJahiaVersion = (): Cypress.Chainable => {
    return cy.apollo({
        fetchPolicy: 'no-cache',
        queryFile: 'graphql/jcr/query/getJahiaVersion.graphql'
    }).then(result => {
        return result?.data?.admin.jahia.version;
    });
};
