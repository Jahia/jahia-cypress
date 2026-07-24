"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */
Object.defineProperty(exports, "__esModule", { value: true });
exports.installConfig = void 0;
/// <reference types="cypress" />
var installConfig = function (configFile) {
    cy.runProvisioningScript({
        script: { fileContent: "- installConfiguration: \"".concat(configFile, "\""), type: 'application/yaml' },
        files: [{
                fileName: "".concat(configFile),
                type: 'text/plain'
            }]
    });
};
exports.installConfig = installConfig;
