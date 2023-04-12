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

export const deleteNodeProperty = (pathOrId: string, property: string, language: string): Cypress.Chainable => {
    return cy.apollo({
        variables: {
            pathOrId: pathOrId,
            property: property,
            language: language
        },
        mutationFile: 'graphql/jcr/mutation/deleteNodeProperty.graphql'
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

export const publishAndWaitJobEnding = (path: string, languages: string[] = ['en']): void => {
    cy.apollo({
        variables: {
            pathOrId: path,
            languages: languages,
            publishSubNodes: true,
            includeSubTree: true
        },
        mutationFile: 'graphql/jcr/mutation/publishNode.graphql'
    });
    waitAllJobsFinished('Publication timeout for node: ' + path, 60000);
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

export const addNode = (variables: { parentPathOrId: string, primaryNodeType: string, name: string, properties?: any[], children?: any[] }): Cypress.Chainable => {
    return cy.apollo({
        variables: variables,
        mutationFile: 'graphql/jcr/mutation/addNode.graphql'
    });
};

export const getNodeByPath = (path: string, properties?: string[], language?:string): Cypress.Chainable => {
    return cy.apollo({
        variables: {
            path: path,
            properties: properties,
            language: language
        },
        queryFile: 'graphql/jcr/query/getNodeByPath.graphql'
    });
};

export const createSite = (siteKey: string, templateSet?: string, serverName?: string, locale?: string, languages?: string): void => {
    const definedLocale = locale ? locale : 'en';
    cy.executeGroovy('groovy/admin/createSite.groovy', {
        SITEKEY: siteKey,
        TEMPLATES_SET: templateSet ? templateSet : 'dx-base-demo-templates',
        SERVERNAME: serverName ? serverName : 'localhost',
        LOCALE: definedLocale,
        LANGUAGES: languages ? `Arrays.asList(${languages})` : `Arrays.asList("${definedLocale}")`
    });
};

export const deleteSite = (siteKey: string): void => {
    cy.executeGroovy('groovy/admin/deleteSite.groovy', {
        SITEKEY: siteKey
    });
};

export const createUser = (userName: string, password: string, properties: { name: string, value: string }[] = []): void => {
    const userProperties = properties.map(property => {
        return 'properties.setProperty("' + property.name + '", "' + property.value + '")';
    });
    cy.executeGroovy('groovy/admin/createUser.groovy', {
        USER_NAME: userName,
        PASSWORD: password ? password : 'password',
        USER_PROPERTIES: userProperties ? userProperties.join('\n') : ''
    });
};

export const deleteUser = (userName: string): void => {
    cy.executeGroovy('groovy/admin/deleteUser.groovy', {
        USER_NAME: userName
    });
};

export const addVanityUrl = (pathOrId: string, language: string, url: string): Cypress.Chainable => {
    return cy.apollo({
        variables: {
            pathOrId: pathOrId,
            language: language,
            url: url
        },
        mutationFile: 'graphql/jcr/mutation/addVanityUrl.graphql'
    });
};

export const getVanityUrl = (path: string, languages: Array<string>): Cypress.Chainable => {
    return cy.apollo({
        variables: {
            path: path,
            languages: languages
        },
        queryFile: 'graphql/jcr/query/getVanityUrls.graphql'
    });
};

export const removeVanityUrl = (pathOrId: string, url: string): Cypress.Chainable => {
    return cy.apollo({
        variables: {
            pathOrId: pathOrId,
            url: url
        },
        mutationFile: 'graphql/jcr/mutation/removeVanityUrl.graphql'
    });
};
