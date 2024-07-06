"use strict";
exports.__esModule = true;
exports.getJahiaVersion = void 0;
var getJahiaVersion = function () {
    return cy.apollo({
        fetchPolicy: 'no-cache',
        queryFile: 'graphql/jcr/query/getJahiaVersion.graphql'
    }).then(function (result) {
        var _a;
        return (_a = result === null || result === void 0 ? void 0 : result.data) === null || _a === void 0 ? void 0 : _a.admin.jahia.version;
    });
};
exports.getJahiaVersion = getJahiaVersion;
