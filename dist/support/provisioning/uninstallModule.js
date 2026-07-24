"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */
Object.defineProperty(exports, "__esModule", { value: true });
exports.uninstallModule = void 0;
/// <reference types="cypress" />
var uninstallModule = function (moduleSymbolicName) {
    cy.runProvisioningScript({
        script: {
            fileContent: '- uninstallModule: "' + moduleSymbolicName + '"\n',
            type: 'application/yaml'
        }
    });
};
exports.uninstallModule = uninstallModule;
