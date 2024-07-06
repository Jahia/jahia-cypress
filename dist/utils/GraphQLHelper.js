"use strict";
/* eslint max-depth: ["error", 5] */
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.getDescriptions = void 0;
// The type name to be used for further introspection can be located either in
// the type object itself or in the ofType object
var addTypes = (function (type, atPath) {
    var newTypes = [];
    if (type.name !== null) {
        newTypes.push({ typeName: type.name, atPath: atPath });
    }
    if (type.ofType && type.ofType.name !== null) {
        newTypes.push({ typeName: type.ofType.name, atPath: atPath });
    }
    return newTypes;
});
// This returns a flat list of all children fields and args for a given GraphQL node
// This list can then be used in Cypress tests to look for missing descriptions
var getDescriptions = function (rootNode) {
    cy.log('Starting analysis from GraphQL node: ' + rootNode);
    return execIntrospection(rootNode, [], [rootNode]).then(function (descriptions) {
        return descriptions;
    });
};
exports.getDescriptions = getDescriptions;
var execIntrospection = function (typeName, descriptions, nodePath) {
    return cy.apollo({
        variables: {
            typeName: typeName
        },
        queryFile: 'graphql/introspection.graphql'
    }).then(function (response) {
        var _a;
        var responseDataType = (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.__type;
        if (responseDataType === null || responseDataType === undefined || responseDataType.kind === 'UNION') {
            return;
        }
        if (responseDataType) {
            // This array will be populated with types identified in the introspection query
            // These will then be further introspected to get their children fields and args
            var fetchSubTypes_1 = [];
            descriptions.push({
                name: responseDataType.name,
                description: responseDataType.description,
                schemaType: '__Type',
                schemaNode: responseDataType,
                nodePath: nodePath
            });
            // The following exploration of the object follows precisely the Graphql Introspection
            // spec available at https://github.com/graphql/graphql-spec/blob/main/spec/Section%204%20--%20Introspection.md
            if (responseDataType.fields) {
                for (var _i = 0, _b = responseDataType.fields; _i < _b.length; _i++) {
                    var graphqlField = _b[_i];
                    var fieldPath = __spreadArray(__spreadArray([], nodePath), [graphqlField.name]);
                    descriptions.push({
                        name: graphqlField.name,
                        description: graphqlField.description,
                        schemaType: '__Field',
                        schemaNode: graphqlField,
                        isDeprecated: graphqlField.isDeprecated,
                        deprecationReason: graphqlField.deprecationReason,
                        nodePath: fieldPath
                    });
                    fetchSubTypes_1 = __spreadArray(__spreadArray([], fetchSubTypes_1), addTypes(graphqlField.type, fieldPath));
                    if (graphqlField.args) {
                        for (var _c = 0, _d = graphqlField.args; _c < _d.length; _c++) {
                            var graphQLInputValue = _d[_c];
                            var inputValuePath = __spreadArray(__spreadArray([], fieldPath), [graphQLInputValue.name]);
                            descriptions.push({
                                name: graphQLInputValue.name,
                                description: graphQLInputValue.description,
                                schemaType: '__InputValue',
                                schemaNode: graphQLInputValue,
                                isDeprecated: graphQLInputValue.isDeprecated,
                                deprecationReason: graphQLInputValue.deprecationReason,
                                nodePath: inputValuePath
                            });
                            fetchSubTypes_1 = __spreadArray(__spreadArray([], fetchSubTypes_1), addTypes(graphQLInputValue.type, inputValuePath));
                        }
                    }
                }
            }
            if (responseDataType.interfaces) {
                for (var _e = 0, _f = responseDataType.interfaces; _e < _f.length; _e++) {
                    var graphQLInterfaceType = _f[_e];
                    descriptions.push({
                        name: graphQLInterfaceType.name,
                        description: graphQLInterfaceType.description,
                        schemaType: '__Type',
                        schemaNode: graphQLInterfaceType,
                        nodePath: nodePath
                    });
                    fetchSubTypes_1 = __spreadArray(__spreadArray([], fetchSubTypes_1), addTypes(graphQLInterfaceType, nodePath));
                }
            }
            if (responseDataType.possibleTypes) {
                for (var _g = 0, _h = responseDataType.possibleTypes; _g < _h.length; _g++) {
                    var graphQLType = _h[_g];
                    var fieldPath = __spreadArray(__spreadArray([], nodePath), [responseDataType.name, graphQLType.name]);
                    descriptions.push({
                        name: graphQLType.name,
                        description: graphQLType.description,
                        schemaType: '__Type',
                        schemaNode: graphQLType,
                        nodePath: fieldPath
                    });
                    fetchSubTypes_1 = __spreadArray(__spreadArray([], fetchSubTypes_1), addTypes(graphQLType, fieldPath));
                }
            }
            if (responseDataType.enumValues) {
                for (var _j = 0, _k = responseDataType.enumValues; _j < _k.length; _j++) {
                    var graphQLEnumValue = _k[_j];
                    var enumPath = __spreadArray(__spreadArray([], nodePath), [responseDataType.name, graphQLEnumValue.name]);
                    descriptions.push({
                        name: graphQLEnumValue.name,
                        description: graphQLEnumValue.description,
                        schemaType: '__EnumValue',
                        schemaNode: graphQLEnumValue,
                        nodePath: enumPath,
                        isDeprecated: graphQLEnumValue.isDeprecated,
                        deprecationReason: graphQLEnumValue.deprecationReason
                    });
                }
            }
            if (responseDataType.inputFields) {
                for (var _l = 0, _m = responseDataType.inputFields; _l < _m.length; _l++) {
                    var graphQLInputValue = _m[_l];
                    var inputValuePath = __spreadArray(__spreadArray([], nodePath), [responseDataType.name, graphQLInputValue.name]);
                    descriptions.push({
                        name: graphQLInputValue.name,
                        description: graphQLInputValue.description,
                        schemaType: '__InputValue',
                        schemaNode: graphQLInputValue,
                        nodePath: inputValuePath
                    });
                    fetchSubTypes_1 = __spreadArray(__spreadArray([], fetchSubTypes_1), addTypes(graphQLInputValue.type, inputValuePath));
                }
            }
            if (responseDataType.ofType) {
                fetchSubTypes_1 = __spreadArray(__spreadArray([], fetchSubTypes_1), addTypes(responseDataType.ofType, nodePath));
            }
            var uniqueSubTypes = fetchSubTypes_1
                // Filter out duplicate types to ensure we don't introspect the same type multiple times
                .filter(function (obj, index) { return fetchSubTypes_1.findIndex(function (item) { return item.typeName === obj.typeName; }) === index; })
                // Filter out types that have a name of null (e.g. List of non-null types)
                .filter(function (subtype) { return subtype.typeName !== null; })
                // Remove types that might have already been introspected
                .filter(function (subtype) { return descriptions.find(function (d) { return d.schemaType === '__Type' && d.name === subtype.typeName; }) === undefined; });
            // If there are no subtypes to introspect, we still need to return the descriptions
            if (uniqueSubTypes.length === 0) {
                return descriptions;
            }
            return Cypress.Promise.each(uniqueSubTypes, function (subType) {
                return execIntrospection(subType.typeName, descriptions, __spreadArray(__spreadArray([], subType.atPath), [subType.typeName]));
            }).then(function () { return descriptions; }); // Return descriptions after all recursive calls have completed
        }
    });
};
