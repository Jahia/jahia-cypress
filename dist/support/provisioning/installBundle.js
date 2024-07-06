"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */
exports.__esModule = true;
exports.installBundle = void 0;
/// <reference types="cypress" />
var installBundle = function (bundleFile) {
    cy.runProvisioningScript([{ installBundle: bundleFile }], [{
            fileName: bundleFile,
            type: 'text/plain'
        }]);
};
exports.installBundle = installBundle;
