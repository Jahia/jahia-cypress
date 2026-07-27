
// Groovy script to be used for logging test suite and test case start/end markers
const loggerScript = 'groovy/logger.groovy';
const delimeters = {spec: '='.repeat(20), test: '-'.repeat(20)};

/**
 * Generates a marker for the beginning or end of a test suite.
 * @param action - The action being performed (e.g., "Starting" or "Ending").
 * @param name - The name of the test suite.
 * @returns A formatted string representing the suite marker.
 */
const specMarker = (action: string, name: string): string => `${delimeters.spec} ${action} ${name} ${delimeters.spec}`;

/**
 * Generates a marker for the beginning or end of a test.
 * @param action - The action being performed (e.g., "Starting" or "Ending").
 * @param title - The title of the test.
 * @returns A formatted string representing the test marker.
 */
const testMarker = (action: string, title: string): string => `${delimeters.test} ${action} ${title} ${delimeters.test}`;

/**
 * Enables logging markers for the start and end of test suites and individual tests.
 * This function sets up hooks to log messages before and after each test and suite execution.
 * It uses a Groovy script to log the messages, which can be useful for tracking test execution in Jahia logs.
 */
const enableSpecsMarker = (): void => {
    before(() => {
        cy.executeGroovy(loggerScript, {MESSAGE: specMarker('[BEGIN SPEC]', Cypress.spec.name)});
    });

    beforeEach(function () {
        cy.executeGroovy(loggerScript, {MESSAGE: testMarker('[BEGIN TEST]', this.currentTest!.title)});
    });

    afterEach(function () {
        cy.executeGroovy(loggerScript, {MESSAGE: testMarker('[END TEST]', this.currentTest!.title)});
    });

    after(() => {
        cy.executeGroovy(loggerScript, {MESSAGE: specMarker('[END SPEC]', Cypress.spec.name)});
    });
};

export const jahiaLog = {enableSpecsMarker};
