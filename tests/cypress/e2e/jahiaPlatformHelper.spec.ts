import '../../../src/support/apollo/apollo';
import '../../../src/support/provisioning/runProvisioningScript';
import {JAHIA_VERSION_ENV_VAR, cacheJahiaRelease, startModule, stopModule, waitForModuleActive} from '../../../src/utils/JahiaPlatformHelper';

type StringDictionary = {[key: string]: string};

// The modules the stubbed dashboard API lists as started, by id
let startedModules: StringDictionary = {};
// Every script the stubbed provisioning API received
let scripts: StringDictionary[][] = [];
// How many more dashboard polls answer before a start or a stop takes effect
let pollsBeforeEffect = 0;
let pendingEffect: (() => void) | null = null;

Cypress.Commands.add('apollo', (() => {
    if (pendingEffect && pollsBeforeEffect-- <= 0) {
        pendingEffect();
        pendingEffect = null;
    }

    const modules = Object.entries(startedModules).map(([id, version]) => ({id, version}));
    return cy.wrap({data: {dashboard: {modules}}});
}) as Cypress.CommandFn<'apollo'>);

Cypress.Commands.add('runProvisioningScript', ((params: {script: StringDictionary[]}) => {
    scripts.push(params.script);
    const [operation, moduleQualifier] = Object.entries(params.script[0])[0];
    const [id, version] = moduleQualifier.split('/');
    pendingEffect = operation.startsWith('start') ?
        () => {
            startedModules[id] = version;
        } :
        () => {
            delete startedModules[id];
        };

    return cy.wrap(null);
}) as Cypress.CommandFn<'runProvisioningScript'>);

describe('JahiaPlatformHelper module lifecycle', () => {
    beforeEach(() => {
        startedModules = {};
        scripts = [];
        pollsBeforeEffect = 0;
        pendingEffect = null;
    });

    it('starts a module with startBundle before Jahia 8.2.3', () => {
        cacheJahiaRelease('8.2.2.9');
        startModule('my-module/1.0.0');
        cy.then(() => {
            expect(scripts).to.deep.equal([[{startBundle: 'my-module/1.0.0'}]]);
            expect(startedModules).to.deep.equal({'my-module': '1.0.0'});
        });
    });

    it('starts a module with startModule from Jahia 8.2.3', () => {
        cacheJahiaRelease('8.2.3.0');
        startModule('my-module/1.0.0');
        cy.then(() => {
            expect(scripts).to.deep.equal([[{startModule: 'my-module/1.0.0'}]]);
        });
    });

    it('stops a module with stopBundle before Jahia 8.2.3', () => {
        startedModules = {'my-module': '1.0.0'};
        cacheJahiaRelease('8.1.9.6');
        stopModule('my-module/1.0.0');
        cy.then(() => {
            expect(scripts).to.deep.equal([[{stopBundle: 'my-module/1.0.0'}]]);
            expect(startedModules).to.deep.equal({});
        });
    });

    it('stops a module with stopModule on a SNAPSHOT release from Jahia 8.2.3', () => {
        startedModules = {'my-module': '1.0.0'};
        cacheJahiaRelease('8.2.4.0-SNAPSHOT');
        stopModule('my-module/1.0.0');
        cy.then(() => {
            expect(scripts).to.deep.equal([[{stopModule: 'my-module/1.0.0'}]]);
        });
    });

    it('keeps polling until the module reports ACTIVE', () => {
        cacheJahiaRelease('8.2.3.0');
        pollsBeforeEffect = 2;
        startModule('my-module/1.0.0');
        cy.then(() => {
            expect(pendingEffect).to.equal(null);
            expect(startedModules).to.deep.equal({'my-module': '1.0.0'});
        });
    });

    it('throws a clear error when no Jahia release is cached', () => {
        Cypress.env(JAHIA_VERSION_ENV_VAR, '');
        expect(() => startModule('my-module/1.0.0')).to.throw(`${JAHIA_VERSION_ENV_VAR} is not set`);
        expect(scripts).to.deep.equal([]);
    });

    it('fails when the module never reports ACTIVE within the timeout', () => {
        cy.on('fail', error => {
            expect(error.message).to.equal('my-module never reported ACTIVE within 1000 ms');
            return false;
        });
        waitForModuleActive('my-module', 1000);
    });

    it('keeps polling until the module no longer reports ACTIVE', () => {
        startedModules = {'my-module': '1.0.0'};
        cacheJahiaRelease('8.2.3.0');
        pollsBeforeEffect = 2;
        stopModule('my-module/1.0.0');
        cy.then(() => {
            expect(pendingEffect).to.equal(null);
            expect(startedModules).to.deep.equal({});
        });
    });
});
