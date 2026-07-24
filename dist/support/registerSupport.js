"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSupport = void 0;
var apollo_1 = require("./apollo");
var provisioning_1 = require("./provisioning");
var login_1 = require("./login");
var logout_1 = require("./logout");
var fixture_1 = require("./fixture");
var repeatUntil_1 = require("./repeatUntil");
var testStep_1 = require("./testStep");
var jfaker_1 = require("./jfaker");
var modSince_1 = require("./modSince");
var contextReporter_1 = require("./contextReporter");
var jahiaLog_1 = require("./jahiaLog");
var registerSupport = function () {
    Cypress.Commands.add('apolloClient', apollo_1.apolloClient);
    Cypress.Commands.add('apollo', { prevSubject: 'optional' }, apollo_1.apollo);
    Cypress.Commands.add('runProvisioningScript', provisioning_1.runProvisioningScript);
    Cypress.Commands.add('executeGroovy', provisioning_1.executeGroovy);
    Cypress.Commands.add('installModule', provisioning_1.installModule);
    Cypress.Commands.add('installAndStartModule', provisioning_1.installAndStartModule);
    Cypress.Commands.add('uninstallModule', provisioning_1.uninstallModule);
    Cypress.Commands.add('login', login_1.login);
    Cypress.Commands.add('loginAndStoreSession', login_1.loginAndStoreSession);
    Cypress.Commands.add('logout', logout_1.logout);
    Cypress.Commands.add('repeatUntil', repeatUntil_1.repeatUntil);
    Cypress.Commands.overwrite('fixture', fixture_1.fixture);
    Cypress.Commands.add('step', testStep_1.step);
    // Register it.since()/describe.since()
    modSince_1.modSince.enable();
    jahiaLog_1.jahiaLog.enableSpecsMarker();
    /**
     * Override Cypress `type()` command to interpret special characters (e.g., {, }, etc.) either literally or as commands.
     * The behavior is controlled by the `parseSpecialCharSequences` option, which can be set to `true`
     * to enable command parsing or `false` to treat special characters as literal input.
     *
     * Since Cypress `clear()` command is an alias for `.type('{selectall}{del}')`,
     * such case has to be handled to ensure that the special character sequences are properly interpreted when clearing the input.
     * Also cover older Cypress versions which were using {backspace} was used instead of {del} .
     */
    Cypress.Commands.overwrite('type', function (originalFn, element, text, options) {
        if (options === void 0) { options = {}; }
        // Check if this is Cypress `.clear() call
        var isCypressClearSequence = ['{selectall}{del}', '{selectall}{backspace}'].includes(text.toString());
        // Do not override if this is `.clear()` call or data type is `faker`
        var parseSpecialCharSequences = isCypressClearSequence || jfaker_1.jfaker.getDataType() === 'faker';
        // Merge options with passed ones (if any)
        var newOptions = __assign({ parseSpecialCharSequences: parseSpecialCharSequences }, options);
        return originalFn(element, text, newOptions);
    });
    /**
     * Listen to the 'test:after:run' event to collect tags and other context information after each test execution.
     */
    Cypress.on('test:after:run', function (test, runnable) {
        (0, contextReporter_1.collect)(test, runnable);
    });
};
exports.registerSupport = registerSupport;
