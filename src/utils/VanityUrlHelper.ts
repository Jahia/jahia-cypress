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
