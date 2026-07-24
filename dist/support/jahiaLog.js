"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jahiaLog = void 0;
// Groovy script to be used for logging test suite and test case start/end markers
var loggerScript = 'groovy/logger.groovy';
var delimeters = { spec: '='.repeat(20), test: '-'.repeat(20) };
/**
 * Generates a marker for the beginning or end of a test suite.
 * @param action - The action being performed (e.g., "Starting" or "Ending").
 * @param name - The name of the test suite.
 * @returns A formatted string representing the suite marker.
 */
var specMarker = function (action, name) { return "".concat(delimeters.spec, " ").concat(action, " ").concat(name, " ").concat(delimeters.spec); };
/**
 * Generates a marker for the beginning or end of a test.
 * @param action - The action being performed (e.g., "Starting" or "Ending").
 * @param title - The title of the test.
 * @returns A formatted string representing the test marker.
 */
var testMarker = function (action, title) { return "".concat(delimeters.test, " ").concat(action, " ").concat(title, " ").concat(delimeters.test); };
/**
 * Enables logging markers for the start and end of test suites and individual tests.
 * This function sets up hooks to log messages before and after each test and suite execution.
 * It uses a Groovy script to log the messages, which can be useful for tracking test execution in Jahia logs.
 */
var enableSpecsMarker = function () {
    before(function () {
        cy.executeGroovy(loggerScript, { MESSAGE: specMarker('[BEGIN SPEC]', Cypress.spec.name) });
    });
    beforeEach(function () {
        cy.executeGroovy(loggerScript, { MESSAGE: testMarker('[BEGIN TEST]', this.currentTest.title) });
    });
    afterEach(function () {
        cy.executeGroovy(loggerScript, { MESSAGE: testMarker('[END TEST]', this.currentTest.title) });
    });
    after(function () {
        cy.executeGroovy(loggerScript, { MESSAGE: specMarker('[END SPEC]', Cypress.spec.name) });
    });
};
exports.jahiaLog = { enableSpecsMarker: enableSpecsMarker };
