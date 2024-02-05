interface GraphQLType {
    name: string
    nodePath: string[]
    kind: string
    description: string
}

// This returns a flat list of all children fields and args for a given GraphQL node
// This list can then be used in Cypress tests to look for missing descriptions
export const getDescriptions = (rootNode: string): Cypress.Chainable => {
    cy.log('Starting analysis from GraphQL node: ' + rootNode);
    return execIntrospection(rootNode, [], [rootNode]).then(types => {
        return types;
    });
};

const execIntrospection = (typeName: string, types: GraphQLType[], nodePath): Cypress.Chainable => {
    // Do not execute introspection on default type names (String, Int, ...) 
    // only process a node once for a given name
    if (['String', 'Int', 'Boolean', 'Long'].includes(typeName) || types.find(t => t.name === typeName) !== undefined) {
        return;
    }

    return cy.apollo({
        variables: {
            typeName: typeName
        },
        queryFile: 'graphql/introspection.graphql'
    }).then(response => {
        const responseDataType = response?.data?.__type;
        if (responseDataType === null || responseDataType === undefined || responseDataType.kind === 'UNION') {
            return;
        }

        if (responseDataType) {
            types.push({
                nodePath,
                ...responseDataType
            });
            if (responseDataType.kind === 'OBJECT') {
                const fields = responseDataType.fields;
                if (fields) {
                    // Looping througth all fields to add to the type array:
                    // - nodes arguments
                    // - leaf nodes (whose content cannot be fetched by deeper introspection query)
                    for (const field of responseDataType.fields) {
                        if (field.args) {
                            for (const arg of field.args) {
                                const argPath = [...nodePath, field.name, arg.name];
                                // Only adding an arg to the types array if it's not already present
                                if (types.find(t => t.nodePath.join('/') === argPath.join('/')) === undefined) {
                                    types.push({
                                        nodePath: argPath,
                                        kind: 'ARGUMENT',
                                        ...arg
                                    });
                                }
                            }
                        }

                        if (
                            (field.type.ofType !== null && ['String', 'Int', 'Boolean', 'Long'].includes(field.type.ofType.name)) ||
                            (field.type !== null && ['String', 'Int', 'Boolean', 'Long'].includes(field.type.name))
                        ) {
                            const fieldPath = [...nodePath, field.name];
                            if (types.find(t => t.nodePath.join('/') === fieldPath.join('/')) === undefined) {
                                types.push({
                                    nodePath: fieldPath,
                                    kind: field.type.kind,
                                    ...field
                                });
                            }
                        }
                    }

                    // Fetch more data via a deeper introspection query whenever possible
                    return Cypress.Promise.each(fields, (field: any) => {
                        if (['OBJECT', 'NON_NULL', 'SCALAR', 'LIST'].includes(field.type.kind)) {
                            let childTypeName = field.type.name;
                            if (field.type.kind === 'NON_NULL' || field.type.kind === 'LIST') {
                                childTypeName = field.type.ofType.name;
                            }

                            return execIntrospection(childTypeName, types, [...nodePath, childTypeName]);
                        }
                    }).then(() => types); // Return types after all recursive calls have completed
                }
            }
        }

        return types;
    });
};

