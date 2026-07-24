"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeGroovy = void 0;
/// <reference types="cypress" />
var serverDefaults = {
    url: Cypress.config().baseUrl,
    username: 'root',
    password: Cypress.env('SUPER_USER_PASSWORD')
};
var executeGroovy = function (scriptFile, replacements, jahiaServer) {
    if (jahiaServer === void 0) { jahiaServer = serverDefaults; }
    var result;
    var duration;
    var scriptContent;
    var startTime = Date.now();
    var replacementsLabel = replacements && Object.keys(replacements).length > 0 ?
        " \u2014 ".concat(JSON.stringify(replacements)) :
        '';
    var logger = Cypress.log({
        autoEnd: false,
        name: 'executeGroovy',
        displayName: 'groovy',
        message: "".concat(scriptFile).concat(replacementsLabel),
        consoleProps: function () { return ({
            Script: scriptFile,
            'Script Content': scriptContent !== null && scriptContent !== void 0 ? scriptContent : '(loading...)',
            Replacements: replacements !== null && replacements !== void 0 ? replacements : {},
            Server: jahiaServer.url,
            Duration: duration === undefined ? 'pending' : "".concat(duration, "ms"),
            Result: result
        }); }
    });
    cy.fixture(scriptFile, 'utf-8').then(function (content) {
        var processed = content;
        if (replacements) {
            Object.keys(replacements).forEach(function (k) {
                processed = processed.replaceAll(k, replacements[k]);
            });
        }
        scriptContent = processed;
    });
    cy.runProvisioningScript({
        script: {
            fileContent: '- executeScript: "' + scriptFile + '"',
            type: 'application/yaml'
        },
        files: [{
                fileName: scriptFile,
                replacements: replacements,
                type: 'text/plain',
                encoding: 'utf-8'
            }],
        jahiaServer: jahiaServer,
        options: { log: false }
    }).then(function (r) {
        result = r === null || r === void 0 ? void 0 : r[0];
        duration = Date.now() - startTime;
        var hasFailed = typeof result === 'string' && result.includes('.failed');
        var prefix = hasFailed ? '❌ ' : '✅ ';
        logger.set('message', "".concat(prefix).concat(scriptFile).concat(replacementsLabel));
        logger === null || logger === void 0 ? void 0 : logger.end();
        return result;
    });
};
exports.executeGroovy = executeGroovy;
