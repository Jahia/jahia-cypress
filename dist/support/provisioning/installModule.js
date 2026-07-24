"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */
Object.defineProperty(exports, "__esModule", { value: true });
exports.installAndStartModule = exports.installModule = void 0;
/// <reference types="cypress" />
var installModule = function (moduleFile) {
    cy.runProvisioningScript({
        script: [{ installModule: moduleFile }],
        files: [{
                fileName: moduleFile,
                type: 'text/plain'
            }]
    });
};
exports.installModule = installModule;
var installAndStartModule = function (moduleFile) {
    cy.runProvisioningScript({
        script: [{ installAndStartModule: moduleFile }],
        files: [{
                fileName: moduleFile,
                type: 'text/plain'
            }]
    });
};
exports.installAndStartModule = installAndStartModule;
