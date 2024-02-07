/* eslint max-depth: ["error", 5] */

interface GraphQLField {
    name: string;
}

interface GraphQLDescription {
    name: string; // Name of the element in the schema
    description: string; // Description of the element in the schema
    schemaType: string; // Type of the element in the schema according to the GraphQL spec
    schemaNode: GraphQLField; // The actual node fetched from the schema
    nodePath: string[] // The path to the node in the schema
}

// This returns a flat list of all children fields and args for a given GraphQL node
// This list can then be used in Cypress tests to look for missing descriptions
export const getDescriptions = (rootNode: string): Cypress.Chainable => {
    cy.log('Starting analysis from GraphQL node: ' + rootNode);
    return execIntrospection(rootNode, [], [rootNode]).then(descriptions => {
        return descriptions;
    });
};

const execIntrospection = (typeName: string, descriptions: GraphQLDescription[], nodePath): Cypress.Chainable => {
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
            // This array will be populated with types identified in the introspection query
            // These will then be further introspected to get their children fields and args
            const fetchSubTypes: {typeName: string, atPath: string[]}[] = [];

            descriptions.push({
                name: responseDataType.name,
                description: responseDataType.description,
                schemaType: '__Type',
                schemaNode: responseDataType,
                nodePath
            });

            // The following exploration of the object follows precisely the Graphql Introspection
            // spec available at https://github.com/graphql/graphql-spec/blob/main/spec/Section%204%20--%20Introspection.md
            if (responseDataType.fields) {
                for (const graphqlField of responseDataType.fields) {
                    const fieldPath = [...nodePath, responseDataType.name, graphqlField.name];
                    descriptions.push({
                        name: graphqlField.name,
                        description: graphqlField.description,
                        schemaType: '__Field',
                        schemaNode: graphqlField,
                        nodePath: fieldPath
                    });
                    fetchSubTypes.push({typeName: graphqlField.type.name, atPath: fieldPath});

                    if (graphqlField.args) {
                        for (const graphQLInputValue of graphqlField.args) {
                            const inputValuePath = [...fieldPath, graphQLInputValue.name];
                            descriptions.push({
                                name: graphQLInputValue.name,
                                description: graphQLInputValue.description,
                                schemaType: '__InputValue',
                                schemaNode: graphQLInputValue,
                                nodePath: inputValuePath
                            });
                            fetchSubTypes.push({typeName: graphQLInputValue.type.name, atPath: inputValuePath});
                        }
                    }
                }
            }

            if (responseDataType.interfaces) {
                for (const graphQLInterfaceType of responseDataType.interfaces) {
                    const fieldPath = [...nodePath, responseDataType.name, graphQLInterfaceType.name];
                    descriptions.push({
                        name: graphQLInterfaceType.name,
                        description: graphQLInterfaceType.description,
                        schemaType: '__Type',
                        schemaNode: graphQLInterfaceType,
                        nodePath: fieldPath
                    });
                    fetchSubTypes.push({typeName: graphQLInterfaceType.name, atPath: fieldPath});
                }
            }

            if (responseDataType.possibleTypes) {
                for (const graphQLType of responseDataType.possibleTypes) {
                    const fieldPath = [...nodePath, responseDataType.name, graphQLType.name];
                    descriptions.push({
                        name: graphQLType.name,
                        description: graphQLType.description,
                        schemaType: '__Type',
                        schemaNode: graphQLType,
                        nodePath: fieldPath
                    });
                    fetchSubTypes.push({typeName: graphQLType.name, atPath: fieldPath});
                }
            }

            if (responseDataType.enumValues) {
                for (const graphQLEnumValue of responseDataType.enumValues) {
                    const enumPath = [...nodePath, responseDataType.name, graphQLEnumValue.name];
                    descriptions.push({
                        name: graphQLEnumValue.name,
                        description: graphQLEnumValue.description,
                        schemaType: '__EnumValue',
                        schemaNode: graphQLEnumValue,
                        nodePath: enumPath
                    });
                }
            }

            if (responseDataType.inputFields) {
                for (const graphQLInputValue of responseDataType.inputFields) {
                    const inputValuePath = [...nodePath, responseDataType.name, graphQLInputValue.name];
                    descriptions.push({
                        name: graphQLInputValue.name,
                        description: graphQLInputValue.description,
                        schemaType: '__InputValue',
                        schemaNode: graphQLInputValue,
                        nodePath: inputValuePath
                    });
                    fetchSubTypes.push({typeName: graphQLInputValue.type.name, atPath: inputValuePath});
                }
            }

            if (responseDataType.ofType) {
                fetchSubTypes.push({typeName: responseDataType.ofType.name, atPath: nodePath});
            }

            const uniqueSubTypes = fetchSubTypes
                // Filter out duplicate types to ensure we don't introspect the same type multiple times
                .filter((obj, index) => fetchSubTypes.findIndex(item => item.typeName === obj.typeName) === index)
                // Filter out types that have a name of null (e.g. List of non-null types)
                .filter(subtype => subtype.typeName !== null)
                // Remove types that might have already been introspected
                .filter(subtype => descriptions.find(d => d.schemaType === '__Type' && d.name === subtype.typeName) === undefined);

            return Cypress.Promise.each(uniqueSubTypes, subType => {
                return execIntrospection(subType.typeName, descriptions, [...subType.atPath, subType.typeName]);
            }).then(() => descriptions); // Return descriptions after all recursive calls have completed
        }
    });
};

