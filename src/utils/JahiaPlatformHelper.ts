/**
 * Fetches the Jahia version using a GraphQL query.
 * @returns Cypress.Chainable that resolves to the Jahia version record (e.g., release: "8.0.0", ...).
 * @note In rare cases tests might override baseUrl (e.g. when Jahia is configured with custom context path,
 *       but spec want to use just a host, without the context path), e.g.:
 *       it('Crawl pages', {baseUrl: serverURL.origin}, () => { ... })
 *       In such case(s) this call will fail because the GraphQL endpoint will not be found at the root of the host.
 *       To prevent such failure, we ensure GraphQL client uses full Jahia url as configured in env variable.
 */
export const getJahiaVersion = (): Cypress.Chainable => {
    return cy.apolloClient({url: Cypress.env('JAHIA_URL') || Cypress.config().baseUrl}).then(() => {
        return cy.apollo({
            fetchPolicy: 'no-cache',
            queryFile: 'graphql/jcr/query/getJahiaVersion.graphql'
        }).then(result => {
            return result?.data?.admin.jahia.version;
        });
    });
};

export const getStartedModulesVersion = (): Cypress.Chainable => {
    return cy.apollo({
        fetchPolicy: 'no-cache',
        queryFile: 'graphql/jcr/query/getStartedModulesVersion.graphql'
    }).then(result => {
        return result?.data?.dashboard.modules;
    });
};

export const getStartedModuleVersion = (moduleId: string): Cypress.Chainable => {
    return getStartedModulesVersion().then(modules => {
        return modules.find(module => module.id === moduleId)?.version;
    });
};
