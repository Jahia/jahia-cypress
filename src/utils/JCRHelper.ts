type Workspace = 'EDIT' | 'LIVE';

export const setNodeProperty = (pathOrId: string, property: string, value: string | Array<string>, language: string): Cypress.Chainable => {
    let mutationFile = 'graphql/jcr/mutation/setProperty.graphql';
    if (value instanceof Array) {
        mutationFile = 'graphql/jcr/mutation/setPropertyValues.graphql';
    }

    return cy.apollo({
        variables: {
            pathOrId: pathOrId,
            property: property,
            language: language,
            value: value
        },
        mutationFile
    });
};

export const deleteNode = (pathOrId: string, workspace: Workspace = 'EDIT'): Cypress.Chainable => {
    return cy.apollo({
        variables: {
            pathOrId: pathOrId,
            workspace
        },
        mutationFile: 'graphql/jcr/mutation/deleteNode.graphql'
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

export const addNode = (variables: {
    parentPathOrId: string,
    primaryNodeType: string,
    name: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    properties?: any [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children?: any [],
    mixins?: string []
}): Cypress.Chainable => {
    return cy.apollo({
        variables: variables,
        mutationFile: 'graphql/jcr/mutation/addNode.graphql'
    });
};

export const addMixins = (pathOrId: string, mixins: string[]): Cypress.Chainable => {
    return cy.apollo({
        variables: {pathOrId: pathOrId, mixins: mixins},
        mutationFile: 'graphql/jcr/mutation/addMixins.graphql'
    });
};

// eslint-disable-next-line max-params
export const getNodeByPath = (path: string, properties?: string[], language?: string, childrenTypes: string[] = [], workspace: Workspace = 'EDIT'): Cypress.Chainable => {
    return cy.apollo({
        variables: {
            path: path,
            properties: properties,
            language: language,
            childrenTypes: childrenTypes || [],
            workspace: workspace || 'EDIT'
        },
        queryFile: 'graphql/jcr/query/getNodeByPath.graphql'
    });
};

export const getNodeAcl = (path: string): Cypress.Chainable => {
    return cy.apollo({
        variables: {
            path: path
        },
        queryFile: 'graphql/jcr/query/getNodeAcl.graphql'
    });
};

export const moveNode = (pathOrId: string, destParentPathOrId: string, destName?: string): Cypress.Chainable => {
    return cy.apollo({
        variables: {
            pathOrId: pathOrId,
            destParentPathOrId: destParentPathOrId,
            destName: destName
        },
        mutationFile: 'graphql/jcr/mutation/moveNode.graphql'
    });
};

export const getNodeTypes = (filter = {}): Cypress.Chainable => {
    return cy.apollo({
        variables: {
            filter: filter
        },
        queryFile: 'graphql/jcr/query/getNodeTypes.graphql'
    });
};

export const markForDeletion = (pathOrId: string): Cypress.Chainable => {
    return cy.apollo(
        {
            variables: {
                pathOrId: pathOrId
            },
            mutationFile: 'graphql/jcr/mutation/markForDeletion.graphql'
        }
    );
};

export const uploadFile = (fixturePath: string, parentPathOrId: string, name: string, mimeType: string): Cypress.Chainable => {
    return cy.fixture(fixturePath, 'binary')
        .then(image => {
            const blob = Cypress.Blob.binaryStringToBlob(image, mimeType);
            const file = new File([blob], name, {type: blob.type});
            return cy.apollo({
                mutationFile: 'graphql/jcr/mutation/uploadFile.graphql',
                variables: {
                    parentPathOrId,
                    name,
                    mimeType,
                    file
                }
            });
        });
};
