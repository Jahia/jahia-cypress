import '../../../src/support/apollo/apollo';
import {modSince, initializeVersionSupport, JAHIA_VERSION_ENV_VAR} from '../../../src/support/modSince';

// Enable version gating
modSince.enable();

// Stub apollo command
Cypress.Commands.add('apollo', {prevSubject: 'optional'}, () => {
    return cy.wrap({
        data: {
            admin: {
                jahia: {
                    version: {
                        release: '8.2.0-SNAPSHOT'
                    }
                }
            }
        }
    });
});

describe('itSince support', () => {
    describe('registration', () => {
        it('attaches the since helper to it and it.only', () => {
            expect(it.since).to.be.a('function');
            expect(it.only.since).to.be.a('function');
        });

        it('attaches the since helper to describe and describe.only', () => {
            expect(describe.since).to.be.a('function');
            expect(describe.only.since).to.be.a('function');
        });
    });

    describe('version initialization', () => {
        it('stores normalized Jahia version in Cypress.env', () => {
            return initializeVersionSupport().then(version => {
                expect(version).to.equal('8.2.0');
                expect(Cypress.env(JAHIA_VERSION_ENV_VAR)).to.equal('8.2.0');
            });
        });
    });

    describe('runtime gating', () => {
        describe('supported version', () => {
            let ran = false;

            beforeEach(() => {
                Cypress.env(JAHIA_VERSION_ENV_VAR, '8.2.0');
            });

            it.since('8.2.0', 'runs test callback when current version matches requirement', () => {
                ran = true;
            });

            it('executes callback for matching version', () => {
                expect(ran).to.equal(true);
            });
        });

        describe('unsupported version', () => {
            let ran = false;

            beforeEach(() => {
                Cypress.env(JAHIA_VERSION_ENV_VAR, '8.1.0');
            });

            it.since('8.2.0', 'skips test callback when current version is lower than requirement', () => {
                ran = true;
            });

            it('does not execute callback for lower version', () => {
                expect(ran).to.equal(false);
            });
        });

        describe('missing version', () => {
            let ran = false;

            beforeEach(() => {
                Cypress.env(JAHIA_VERSION_ENV_VAR, '');
            });

            it.since('8.2.0', 'skips test callback when version is missing', () => {
                ran = true;
            });

            it('does not execute callback when version is empty', () => {
                expect(ran).to.equal(false);
            });
        });

        describe('config overload', () => {
            let ran = false;

            beforeEach(() => {
                Cypress.env(JAHIA_VERSION_ENV_VAR, '8.2.0');
            });

            it.since(
                '8.2.0',
                'supports Cypress config overload',
                {defaultCommandTimeout: 10000},
                () => {
                    ran = true;
                }
            );

            it('executes callback for config overload form', () => {
                expect(ran).to.equal(true);
            });
        });

        describe('describe.since supported version', () => {
            let suiteRan = false;

            before(() => {
                Cypress.env(JAHIA_VERSION_ENV_VAR, '8.2.0');
            });

            describe.since('8.2.0', 'runs suite when current version matches requirement', () => {
                it('executes suite tests for matching version', () => {
                    suiteRan = true;
                });

                it('executes suite callback for matching version', () => {
                    expect(suiteRan).to.equal(true);
                });
            });
        });

        describe('describe.since unsupported version', () => {
            let suiteRan = false;

            before(() => {
                Cypress.env(JAHIA_VERSION_ENV_VAR, '8.1.0');
            });

            describe.since('8.2.0', 'skips suite when current version is lower than requirement', () => {
                it('does not execute suite tests for lower version', () => {
                    suiteRan = true;
                });
            });

            it('does not execute suite callback for lower version', () => {
                expect(suiteRan).to.equal(false);
            });
        });

        describe('describe.since missing version', () => {
            let suiteRan = false;

            before(() => {
                Cypress.env(JAHIA_VERSION_ENV_VAR, '');
            });

            describe.since('8.2.0', 'skips suite when version is missing', () => {
                it('does not execute suite tests when version is empty', () => {
                    suiteRan = true;
                });
            });

            it('does not execute suite callback when version is missing', () => {
                expect(suiteRan).to.equal(false);
            });
        });
    });
});
