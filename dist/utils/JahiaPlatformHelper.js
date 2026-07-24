"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStartedModuleVersion = exports.getStartedModulesVersion = exports.getJahiaVersion = void 0;
/**
 * Fetches the Jahia version using a GraphQL query.
 * @returns Cypress.Chainable that resolves to the Jahia version record (e.g., release: "8.0.0", ...).
 * @note In rare cases tests might override baseUrl (e.g. when Jahia is configured with custom context path,
 *       but spec want to use just a host, without the context path), e.g.:
 *       it('Crawl pages', {baseUrl: serverURL.origin}, () => { ... })
 *       In such case(s) this call will fail because the GraphQL endpoint will not be found at the root of the host.
 *       To prevent such failure, we ensure GraphQL client uses full Jahia url as configured in env variable.
 */
var getJahiaVersion = function () {
    return cy.apolloClient({ url: Cypress.env('JAHIA_URL') || Cypress.config().baseUrl }).then(function () {
        return cy.apollo({
            fetchPolicy: 'no-cache',
            queryFile: 'graphql/jcr/query/getJahiaVersion.graphql'
        }).then(function (result) {
            var _a;
            return (_a = result === null || result === void 0 ? void 0 : result.data) === null || _a === void 0 ? void 0 : _a.admin.jahia.version;
        });
    });
};
exports.getJahiaVersion = getJahiaVersion;
var getStartedModulesVersion = function () {
    return cy.apollo({
        fetchPolicy: 'no-cache',
        queryFile: 'graphql/jcr/query/getStartedModulesVersion.graphql'
    }).then(function (result) {
        var _a;
        return (_a = result === null || result === void 0 ? void 0 : result.data) === null || _a === void 0 ? void 0 : _a.dashboard.modules;
    });
};
exports.getStartedModulesVersion = getStartedModulesVersion;
var getStartedModuleVersion = function (moduleId) {
    return (0, exports.getStartedModulesVersion)().then(function (modules) {
        var _a;
        return (_a = modules.find(function (module) { return module.id === moduleId; })) === null || _a === void 0 ? void 0 : _a.version;
    });
};
exports.getStartedModuleVersion = getStartedModuleVersion;
