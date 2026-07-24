"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyNode = exports.unlockNode = exports.lockNode = exports.uploadFile = exports.markForDeletion = exports.getNodeTypes = exports.moveNode = exports.getNodeAcl = exports.getNodeByPath = exports.removeMixins = exports.addMixins = exports.addNode = exports.deleteNodeProperty = exports.deleteNode = exports.setNodeProperty = void 0;
// eslint-disable-next-line max-params
var setNodeProperty = function (pathOrId, property, value, language, apolloOptions) {
    if (apolloOptions === void 0) { apolloOptions = {}; }
    var mutationFile = 'graphql/jcr/mutation/setProperty.graphql';
    if (value instanceof Array) {
        mutationFile = 'graphql/jcr/mutation/setPropertyValues.graphql';
    }
    return cy.apollo(__assign(__assign({}, apolloOptions), { variables: {
            pathOrId: pathOrId,
            property: property,
            language: language,
            value: value
        }, mutationFile: mutationFile }));
};
exports.setNodeProperty = setNodeProperty;
var deleteNode = function (pathOrId, workspace, apolloOptions) {
    if (workspace === void 0) { workspace = 'EDIT'; }
    if (apolloOptions === void 0) { apolloOptions = {}; }
    return cy.apollo(__assign(__assign({}, apolloOptions), { variables: {
            pathOrId: pathOrId,
            workspace: workspace
        }, mutationFile: 'graphql/jcr/mutation/deleteNode.graphql' }));
};
exports.deleteNode = deleteNode;
var deleteNodeProperty = function (pathOrId, property, language, apolloOptions) {
    if (apolloOptions === void 0) { apolloOptions = {}; }
    return cy.apollo(__assign(__assign({}, apolloOptions), { variables: {
            pathOrId: pathOrId,
            property: property,
            language: language
        }, mutationFile: 'graphql/jcr/mutation/deleteNodeProperty.graphql' }));
};
exports.deleteNodeProperty = deleteNodeProperty;
var addNode = function (variables, apolloOptions) {
    if (apolloOptions === void 0) { apolloOptions = {}; }
    return cy.apollo(__assign(__assign({}, apolloOptions), { variables: variables, mutationFile: 'graphql/jcr/mutation/addNode.graphql' }));
};
exports.addNode = addNode;
var addMixins = function (pathOrId, mixins, apolloOptions) {
    if (apolloOptions === void 0) { apolloOptions = {}; }
    return cy.apollo(__assign(__assign({}, apolloOptions), { variables: { pathOrId: pathOrId, mixins: mixins }, mutationFile: 'graphql/jcr/mutation/addMixins.graphql' }));
};
exports.addMixins = addMixins;
var removeMixins = function (pathOrId, mixins, apolloOptions) {
    if (apolloOptions === void 0) { apolloOptions = {}; }
    return cy.apollo(__assign(__assign({}, apolloOptions), { variables: { pathOrId: pathOrId, mixins: mixins }, mutationFile: 'graphql/jcr/mutation/removeMixins.graphql' }));
};
exports.removeMixins = removeMixins;
// eslint-disable-next-line max-params
var getNodeByPath = function (path, properties, language, childrenTypes, workspace, apolloOptions) {
    if (childrenTypes === void 0) { childrenTypes = []; }
    if (workspace === void 0) { workspace = 'EDIT'; }
    if (apolloOptions === void 0) { apolloOptions = {}; }
    return cy.apollo(__assign(__assign({}, apolloOptions), { variables: {
            path: path,
            properties: properties,
            language: language,
            childrenTypes: childrenTypes || [],
            workspace: workspace || 'EDIT'
        }, queryFile: 'graphql/jcr/query/getNodeByPath.graphql' }));
};
exports.getNodeByPath = getNodeByPath;
var getNodeAcl = function (path, apolloOptions) {
    if (apolloOptions === void 0) { apolloOptions = {}; }
    return cy.apollo(__assign(__assign({}, apolloOptions), { variables: {
            path: path
        }, queryFile: 'graphql/jcr/query/getNodeAcl.graphql' }));
};
exports.getNodeAcl = getNodeAcl;
var moveNode = function (pathOrId, destParentPathOrId, destName, apolloOptions) {
    if (apolloOptions === void 0) { apolloOptions = {}; }
    return cy.apollo(__assign(__assign({}, apolloOptions), { variables: {
            pathOrId: pathOrId,
            destParentPathOrId: destParentPathOrId,
            destName: destName
        }, mutationFile: 'graphql/jcr/mutation/moveNode.graphql' }));
};
exports.moveNode = moveNode;
var getNodeTypes = function (filter, apolloOptions) {
    if (filter === void 0) { filter = {}; }
    if (apolloOptions === void 0) { apolloOptions = {}; }
    return cy.apollo(__assign(__assign({}, apolloOptions), { variables: {
            filter: filter
        }, queryFile: 'graphql/jcr/query/getNodeTypes.graphql' }));
};
exports.getNodeTypes = getNodeTypes;
var markForDeletion = function (pathOrId, apolloOptions) {
    if (apolloOptions === void 0) { apolloOptions = {}; }
    return cy.apollo(__assign(__assign({}, apolloOptions), { variables: {
            pathOrId: pathOrId
        }, mutationFile: 'graphql/jcr/mutation/markForDeletion.graphql' }));
};
exports.markForDeletion = markForDeletion;
var uploadFile = function (fixturePath, parentPathOrId, name, mimeType) {
    return cy.fixture(fixturePath, 'binary')
        .then(function (image) {
        var blob = Cypress.Blob.binaryStringToBlob(image, mimeType);
        var file = new File([blob], name, { type: blob.type });
        return cy.apollo({
            mutationFile: 'graphql/jcr/mutation/uploadFile.graphql',
            variables: {
                parentPathOrId: parentPathOrId,
                name: name,
                mimeType: mimeType,
                file: file
            }
        });
    });
};
exports.uploadFile = uploadFile;
var lockNode = function (pathOrId, apolloOptions) {
    if (apolloOptions === void 0) { apolloOptions = {}; }
    return cy.apollo(__assign(__assign({}, apolloOptions), { mutationFile: 'graphql/jcr/mutation/lockNode.graphql', variables: {
            pathOrId: pathOrId
        } }));
};
exports.lockNode = lockNode;
var unlockNode = function (pathOrId, apolloOptions) {
    if (apolloOptions === void 0) { apolloOptions = {}; }
    return cy.apollo(__assign(__assign({}, apolloOptions), { mutationFile: 'graphql/jcr/mutation/unlockNode.graphql', variables: {
            pathOrId: pathOrId
        } }));
};
exports.unlockNode = unlockNode;
var copyNode = function (pathOrId, destParentPathOrId, destName, apolloOptions) {
    if (apolloOptions === void 0) { apolloOptions = {}; }
    return cy.apollo(__assign(__assign({}, apolloOptions), { variables: {
            pathOrId: pathOrId,
            destParentPathOrId: destParentPathOrId,
            destName: destName
        }, mutationFile: 'graphql/jcr/mutation/copyNode.graphql' }));
};
exports.copyNode = copyNode;
