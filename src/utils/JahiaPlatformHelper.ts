export const getJahiaVersion = (): Cypress.Chainable => {
    return cy.apollo({
        fetchPolicy: 'no-cache',
        queryFile: 'graphql/jcr/query/getJahiaVersion.graphql'
    }).then(result => {
        return result?.data?.admin.jahia.version;
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
