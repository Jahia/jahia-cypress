"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editSite = exports.disableModule = exports.enableModule = exports.deleteSite = exports.createSite = void 0;
// eslint-disable-next-line default-param-last
var createSite = function (siteKey, config, jahiaServer) {
    if (config === void 0) { config = { templateSet: 'dx-base-demo-templates', serverName: 'localhost', locale: 'en' }; }
    cy.executeGroovy('groovy/admin/createSite.groovy', {
        SITEKEY: siteKey,
        TEMPLATES_SET: config.templateSet,
        SERVERNAME: config.serverName,
        LOCALE: config.locale,
        LANGUAGES: config.languages || config.locale
    }, jahiaServer);
};
exports.createSite = createSite;
var deleteSite = function (siteKey, jahiaServer) {
    cy.executeGroovy('groovy/admin/deleteSite.groovy', {
        SITEKEY: siteKey
    }, jahiaServer);
};
exports.deleteSite = deleteSite;
var enableModule = function (moduleName, siteKey, jahiaServer) {
    cy.runProvisioningScript({
        script: {
            fileContent: '- enable: "' + moduleName + '"\n  site: "' + siteKey + '"',
            type: 'application/yaml'
        },
        jahiaServer: jahiaServer
    });
};
exports.enableModule = enableModule;
var disableModule = function (moduleName, siteKey) {
    cy.apollo({
        mutationFile: 'graphql/jcr/mutation/disableModule.graphql',
        variables: { moduleName: moduleName, pathOrId: "/sites/".concat(siteKey) }
    });
};
exports.disableModule = disableModule;
// eslint-disable-next-line default-param-last
var editSite = function (siteKey, config, jahiaServer) {
    if (config === void 0) { config = { serverName: 'localhost' }; }
    cy.executeGroovy('groovy/admin/editSite.groovy', {
        SITEKEY: siteKey,
        SERVERNAME: config.serverName
    }, jahiaServer);
};
exports.editSite = editSite;
