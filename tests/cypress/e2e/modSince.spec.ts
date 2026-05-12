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

        it('attaches the since helper to it.skip and describe.skip', () => {
            expect(it.skip.since).to.be.a('function');
            expect(describe.skip.since).to.be.a('function');
        });

        it('throws clear error when it.since args are swapped', () => {
            expect(() => {
                (it.since as unknown as (requiredVersion: string, title: string, fn?: Mocha.Func) => Mocha.Test)(
                    'my test title',
                    '8.2.0',
                    () => {
                        // no-op
                    }
                );
            }).to.throw('[it.since] Invalid arguments');
        });

        it('throws clear error when describe.since args are swapped', () => {
            expect(() => {
                (describe.since as unknown as (requiredVersion: string, title: string, fn: (this: Mocha.Suite) => void) => Mocha.Suite)(
                    'my suite title',
                    '8.2.0',
                    () => {
                        // no-op
                    }
                );
            }).to.throw('[describe.since] Invalid arguments');
        });
    });

    describe('skip.since title regression', () => {
        const skippedItTitle = 'keeps it.skip.since description as title';
        const skippedSuiteTitle = 'keeps describe.skip.since description as title';
        let skippedItRan = false;
        let skippedDescribeRan = false;

        const skippedIt = it.skip.since('8.2.0', skippedItTitle, () => {
            skippedItRan = true;
        });

        const skippedSuite = describe.skip.since('8.2.0', skippedSuiteTitle, () => {
            it('never runs in skipped describe.since suite', () => {
                skippedDescribeRan = true;
            });
        });

        it('keeps user-provided title for it.skip.since', () => {
            expect(skippedIt.title).to.equal(skippedItTitle);
        });

        it('keeps user-provided title for describe.skip.since', () => {
            expect(skippedSuite.title).to.equal(skippedSuiteTitle);
        });

        it('does not execute callback for it.skip.since', () => {
            expect(skippedItRan).to.equal(false);
        });

        it('does not execute tests inside describe.skip.since', () => {
            expect(skippedDescribeRan).to.equal(false);
        });
    });

    describe('skip compatibility regression', () => {
        const compatItTitle = 'uses title for accidental it.skip(version, title, fn)';
        const compatDescribeTitle = 'uses title for accidental describe.skip(version, title, fn)';
        let compatItRan = false;
        let compatDescribeRan = false;

        const compatIt = (it.skip as unknown as (requiredVersion: string, title: string, fn?: Mocha.Func) => Mocha.Test)(
            '8.3.5.0',
            compatItTitle,
            () => {
                compatItRan = true;
            }
        );

        const compatDescribe = (describe.skip as unknown as (requiredVersion: string, title: string, fn: (this: Mocha.Suite) => void) => Mocha.Suite)(
            '8.3.5.0',
            compatDescribeTitle,
            () => {
                it('must not run inside compat skipped describe', () => {
                    compatDescribeRan = true;
                });
            }
        );

        it('keeps title for accidental it.skip(version, title, fn)', () => {
            expect(compatIt.title).to.equal(compatItTitle);
        });

        it('keeps title for accidental describe.skip(version, title, fn)', () => {
            expect(compatDescribe.title).to.equal(compatDescribeTitle);
        });

        it('does not execute callback for accidental it.skip(version, title, fn)', () => {
            expect(compatItRan).to.equal(false);
        });

        it('does not execute tests for accidental describe.skip(version, title, fn)', () => {
            expect(compatDescribeRan).to.equal(false);
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
        describe('it.since title handling', () => {
            const supportedTitle = 'keeps title for supported it.since test';
            const skippedTitle = 'keeps title for skipped it.since test';
            let supportedRan = false;
            let skippedRan = false;

            beforeEach(() => {
                Cypress.env(JAHIA_VERSION_ENV_VAR, '8.1.0');
            });

            const supportedTest = it.since('8.1.0', supportedTitle, () => {
                supportedRan = true;
            });

            const skippedTest = it.since('8.2.0', skippedTitle, () => {
                skippedRan = true;
            });

            it('keeps user-provided title for supported it.since', () => {
                expect(supportedTest.title).to.equal(supportedTitle);
            });

            it('keeps user-provided title for skipped it.since', () => {
                expect(skippedTest.title).to.equal(skippedTitle);
            });

            it('executes callback for supported it.since', () => {
                expect(supportedRan).to.equal(true);
            });

            it('does not execute callback for skipped it.since', () => {
                expect(skippedRan).to.equal(false);
            });
        });

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
