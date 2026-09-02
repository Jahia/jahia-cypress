/**
 * Tests for the cy.fixture() override
 *
 * The override reads the fixture from the project first, and falls back to the copy shipped with
 * this library when the project has none. These tests cover both paths, and the timeout the
 * fallback read is given.
 */

import {fixture} from '../../../src/support/fixture';

Cypress.Commands.overwrite('fixture', fixture);

const FALLBACK_TIMEOUT = 1234;
const MISSING_FIXTURE = 'groovy/thisFixtureExistsNowhere.groovy';

describe('cy.fixture() override', () => {
    it('reads a fixture from the project', () => {
        cy.fixture('fixtureOverride.json').then(content => {
            expect(content.source).to.equal('project');
        });
    });

    it('reads a fixture from the project with an explicit encoding', () => {
        cy.fixture('fixtureOverride.json', 'utf-8').then(content => {
            expect(content).to.be.a('string');
            expect(content).to.contain('project');
        });
    });

    // The fallback read must take the project's defaultCommandTimeout. It used to carry a private
    // budget of a few hundred milliseconds, which made it the first command to fail on a loaded
    // machine, so a slow disk read failed the test that asked for the fixture.
    describe('when the fixture is in neither place', {defaultCommandTimeout: FALLBACK_TIMEOUT}, () => {
        it('fails on the fallback read, after the project defaultCommandTimeout', done => {
            cy.on('fail', error => {
                expect(error.message).to.contain('node_modules/@jahia/cypress/fixtures/' + MISSING_FIXTURE);
                expect(error.message).to.contain(`${FALLBACK_TIMEOUT}ms`);
                done();
            });

            cy.fixture(MISSING_FIXTURE);
        });
    });
});
