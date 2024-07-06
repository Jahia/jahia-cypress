"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */
exports.__esModule = true;
exports.uninstallBundle = void 0;
/// <reference types="cypress" />
var uninstallBundle = function (bundleSymbolicName) {
    cy.runProvisioningScript({
        fileContent: '- uninstallBundle: "' + bundleSymbolicName + '"\n',
        type: 'application/yaml'
    });
};
exports.uninstallBundle = uninstallBundle;
