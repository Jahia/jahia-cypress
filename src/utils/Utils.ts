export const setNodeProperty = (pathOrId: string, property: string, value: string, language: string): Cypress.Chainable => {
    return cy.apollo({
        variables: {
            pathOrId: pathOrId,
            property: property,
            value: value,
            language: language
        },
        mutationFile: 'graphql/jcr/mutation/setProperty.graphql'
    });
};

export const deleteNode = (pathOrId: string): Cypress.Chainable => {
    return cy.apollo({
        variables: {
            pathOrId: pathOrId
        },
        mutationFile: 'graphql/jcr/mutation/deleteNode.graphql'
    });
};

export const grantRoles = (pathOrId: string, roleNames: Array<string>, principalName: string, principalType: string): Cypress.Chainable => {
    cy.log('Grant role(s) ' + roleNames + ' with principal type ' + principalType + ' to ' + principalName + ' on node ' + pathOrId);
    return cy.apollo({
        variables: {
            pathOrId: pathOrId,
            roleNames: roleNames,
            principalName: principalName,
            principalType: principalType
        },
        mutationFile: 'graphql/jcr/mutation/grantRoles.graphql'
    });
};

export const waitAllJobsFinished = (errorMessage?: string, timeout = 60000): void => {
    cy.waitUntil(
        () =>
            cy
                .apollo({
                    fetchPolicy: 'no-cache',
                    queryFile: 'graphql/jcr/query/getJobsWithStatus.graphql'
                })
                .then(response => {
                    const jobs = response?.data?.admin?.jahia?.scheduler?.jobs;
                    const publicationJobs = jobs.filter(job => job.group === 'PublicationJob');
                    const hasActivePublicationJobs = publicationJobs.some(job => job.jobStatus === 'EXECUTING');
                    return !hasActivePublicationJobs;
                }),
        {
            errorMsg: errorMessage ? errorMessage : 'Jobs are still running before the end of timeout',
            timeout: timeout,
            verbose: true,
            interval: 1000
        }
    );
    // Wait 2 seconds for server sync after publication
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
};

export const addNode = (parentPathOrId: string, primaryNodeType: string, name: string, properties = []): Cypress.Chainable => {
    return cy.apollo({
        variables: {
            parentPathOrId: parentPathOrId,
            primaryNodeType: primaryNodeType,
            name: name,
            properties: properties
        },
        mutationFile: 'graphql/jcr/mutation/addNode.graphql'
    });
};

export const addPage = (variables: {parentPathOrId: string, name: string, template: string, language: string, title?: string}): Cypress.Chainable => {
    return cy.apollo({
        variables: variables,
        mutationFile: 'graphql/jcr/mutation/addPage.graphql'
    });
};

export const getNodeByPath = (path: string): Cypress.Chainable => {
    return cy.apollo({
        variables: {
            path: path
        },
        queryFile: 'graphql/jcr/query/getNodeByPath.graphql'
    });
};
