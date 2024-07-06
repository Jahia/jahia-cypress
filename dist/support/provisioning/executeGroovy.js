"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */
exports.__esModule = true;
exports.executeGroovy = void 0;
/// <reference types="cypress" />
var serverDefaults = {
    url: Cypress.config().baseUrl,
    username: 'root',
    password: Cypress.env('SUPER_USER_PASSWORD')
};
var executeGroovy = function (scriptFile, replacements, jahiaServer) {
    if (jahiaServer === void 0) { jahiaServer = serverDefaults; }
    cy.runProvisioningScript({
        fileContent: '- executeScript: "' + scriptFile + '"',
        type: 'application/yaml'
    }, [{
            fileName: scriptFile,
            replacements: replacements,
            type: 'text/plain'
        }], jahiaServer).then(function (r) { return r[0]; });
};
exports.executeGroovy = executeGroovy;
