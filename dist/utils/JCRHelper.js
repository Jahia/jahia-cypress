"use strict";
exports.__esModule = true;
exports.getNodeTypes = exports.moveNode = exports.getNodeAcl = exports.getNodeByPath = exports.addNode = exports.deleteNodeProperty = exports.deleteNode = exports.setNodeProperty = void 0;
var setNodeProperty = function (pathOrId, property, value, language) {
    var mutationFile = 'graphql/jcr/mutation/setProperty.graphql';
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
        mutationFile: mutationFile
    });
};
exports.setNodeProperty = setNodeProperty;
var deleteNode = function (pathOrId, workspace) {
    if (workspace === void 0) { workspace = 'EDIT'; }
    return cy.apollo({
        variables: {
            pathOrId: pathOrId,
            workspace: workspace
        },
        mutationFile: 'graphql/jcr/mutation/deleteNode.graphql'
    });
};
exports.deleteNode = deleteNode;
var deleteNodeProperty = function (pathOrId, property, language) {
    return cy.apollo({
        variables: {
            pathOrId: pathOrId,
            property: property,
            language: language
        },
        mutationFile: 'graphql/jcr/mutation/deleteNodeProperty.graphql'
    });
};
exports.deleteNodeProperty = deleteNodeProperty;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var addNode = function (variables) {
    return cy.apollo({
        variables: variables,
        mutationFile: 'graphql/jcr/mutation/addNode.graphql'
    });
};
exports.addNode = addNode;
var getNodeByPath = function (path, properties, language, childrenTypes, workspace) {
    if (childrenTypes === void 0) { childrenTypes = []; }
    if (workspace === void 0) { workspace = 'EDIT'; }
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
exports.getNodeByPath = getNodeByPath;
var getNodeAcl = function (path) {
    return cy.apollo({
        variables: {
            path: path
        },
        queryFile: 'graphql/jcr/query/getNodeAcl.graphql'
    });
};
exports.getNodeAcl = getNodeAcl;
var moveNode = function (pathOrId, destParentPathOrId, destName) {
    return cy.apollo({
        variables: {
            pathOrId: pathOrId,
            destParentPathOrId: destParentPathOrId,
            destName: destName
        },
        mutationFile: 'graphql/jcr/mutation/moveNode.graphql'
    });
};
exports.moveNode = moveNode;
var getNodeTypes = function (filter) {
    if (filter === void 0) { filter = {}; }
    return cy.apollo({
        variables: {
            filter: filter
        },
        queryFile: 'graphql/jcr/query/getNodeTypes.graphql'
    });
};
exports.getNodeTypes = getNodeTypes;
