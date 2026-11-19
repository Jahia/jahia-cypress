import {afterSpec, afterTest, isEnabled, keepCurrentSession, sessionThatKeeps, shouldLogout} from '../../../src/support/sessionCleanup';

const COOKIE = 'JSESSIONID';
const logoutCalls: string[] = [];

// Record each logout instead of sending it: this suite runs with no Jahia.
Cypress.Commands.overwrite('request', (_originalFn, options: Partial<Cypress.RequestOptions>) => {
    cy.getCookie(COOKIE).then(cookie => {
        logoutCalls.push(`${options.method} ${options.url} ${cookie?.value}`);
    });
    return cy.wrap({status: 302} as Cypress.Response<unknown>, {log: false});
});

describe('sessionCleanup logout decision', () => {
    it('logs out a session that no later test restores', () => {
        expect(shouldLogout('ABC123', new Set())).to.equal(true);
    });

    it('does nothing when the test left no session cookie', () => {
        expect(shouldLogout(undefined, new Set())).to.equal(false);
    });

    it('keeps a session that cy.session() restores in a later test', () => {
        expect(shouldLogout('ABC123', new Set(['ABC123']))).to.equal(false);
    });

    it('logs out a new session even when another one is kept', () => {
        expect(shouldLogout('DEF456', new Set(['ABC123']))).to.equal(true);
    });
});

describe('sessionCleanup off switch', () => {
    it('stays on by default', () => {
        expect(isEnabled(undefined)).to.equal(true);
        expect(isEnabled(true)).to.equal(true);
    });

    it('turns off for false and for the string false that a shell variable gives', () => {
        expect(isEnabled(false)).to.equal(false);
        expect(isEnabled('false')).to.equal(false);
        expect(isEnabled('FALSE')).to.equal(false);
    });
});

describe('sessionCleanup hooks', {baseUrl: 'http://localhost:8080'}, () => {
    beforeEach(() => {
        logoutCalls.length = 0;
        Cypress.env('JAHIA_LOGOUT_AFTER_TEST', undefined);
    });

    it('logs out the session that the test left', () => {
        cy.setCookie(COOKIE, 'LEFT-1', {domain: 'localhost'});
        cy.then(() => afterTest());
        cy.then(() => expect(logoutCalls).to.deep.equal(['POST /cms/logout LEFT-1']));
    });

    it('sends nothing when JAHIA_LOGOUT_AFTER_TEST is the string false', () => {
        Cypress.env('JAHIA_LOGOUT_AFTER_TEST', 'false');
        cy.setCookie(COOKIE, 'LEFT-2', {domain: 'localhost'});
        cy.then(() => afterTest());
        cy.then(() => expect(logoutCalls).to.deep.equal([]));
    });

    it('sends nothing when the test left no session', () => {
        cy.clearCookies();
        cy.then(() => afterTest());
        cy.then(() => expect(logoutCalls).to.deep.equal([]));
    });

    it('keeps a session that cy.session() stored, and logs it out when the spec ends', () => {
        let setup: () => void;
        const originalFn = ((_id: string, wrappedSetup: () => void) => {
            setup = wrappedSetup;
            return cy.wrap(null);
        }) as unknown as Cypress.CommandOriginalFn<'session'>;
        sessionThatKeeps(originalFn, 'session-root', () => cy.setCookie(COOKIE, 'KEPT-1', {domain: 'localhost'}), {});
        cy.then(() => setup());
        cy.then(() => afterTest());
        cy.then(() => expect(logoutCalls).to.deep.equal([]));
        cy.then(() => afterSpec());
        cy.then(() => expect(logoutCalls).to.deep.equal(['POST /cms/logout KEPT-1']));
    });

    it('keeps a session that cy.session() caches across specs, also when the spec ends', () => {
        cy.setCookie(COOKIE, 'ACROSS-1', {domain: 'localhost'});
        cy.then(() => keepCurrentSession(true));
        cy.then(() => afterTest());
        cy.then(() => afterSpec());
        cy.then(() => expect(logoutCalls).to.deep.equal([]));
    });

    describe('without test isolation', {testIsolation: false}, () => {
        it('keeps the shared session after the test, and logs it out when the spec ends', () => {
            cy.setCookie(COOKIE, 'SHARED-1', {domain: 'localhost'});
            cy.then(() => afterTest());
            cy.then(() => expect(logoutCalls).to.deep.equal([]));
            cy.then(() => afterSpec());
            cy.then(() => expect(logoutCalls).to.deep.equal(['POST /cms/logout SHARED-1']));
        });
    });
});
