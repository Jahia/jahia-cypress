import {afterSpec, afterTest, isEnabled, sessionThatKeeps, shouldLogout} from '../../../src/support/sessionCleanup';

const COOKIE = 'JSESSIONID';
const logoutCalls: string[] = [];
let logoutStatus = 302;

// Record each logout instead of sending it: this suite runs with no Jahia.
Cypress.Commands.overwrite('request', (_originalFn, options: Partial<Cypress.RequestOptions>) => {
    cy.getCookie(COOKIE, {domain: 'localhost'}).then(cookie => {
        logoutCalls.push(`${options.method} ${options.url} ${cookie?.value}`);
    });
    return cy.wrap({status: logoutStatus} as Cypress.Response<unknown>, {log: false});
});

Cypress.Commands.overwrite('session', sessionThatKeeps);

/** Stands for `cy.session()`: records the setup it gets, and sets the cookie of a created or restored session. */
const fakeSession = (sessionId: string, received: {setup?: unknown}) => ((_id: string, setup: unknown) => {
    received.setup = setup;
    return cy.setCookie(COOKIE, sessionId, {domain: 'localhost', log: false}).then(() => null);
}) as unknown as Cypress.CommandOriginalFn<'session'>;

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
        logoutStatus = 302;
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

    it('writes the status in the command log when the logout fails', () => {
        const messages: string[] = [];
        cy.on('log:added', attributes => {
            if (attributes.name === 'sessionCleanup') {
                messages.push(attributes.message);
            }
        });
        logoutStatus = 500;
        cy.setCookie(COOKIE, 'LEFT-3', {domain: 'localhost'});
        cy.then(() => afterTest());
        cy.then(() => expect(messages).to.deep.equal(['The logout of the session that the test left answered 500']));
    });

    it('keeps a session that a real cy.session() created, and logs it out when the spec ends', () => {
        cy.session('real-session', () => {
            cy.setCookie(COOKIE, 'REAL-1', {domain: 'localhost'});
        });
        cy.then(() => afterTest());
        cy.then(() => expect(logoutCalls).to.deep.equal([]));
        cy.then(() => afterSpec());
        cy.then(() => expect(logoutCalls).to.deep.equal(['POST /cms/logout REAL-1']));
    });

    it('passes the setup to cy.session() unchanged', () => {
        const received: {setup?: unknown} = {};
        const setup = () => cy.log('setup');
        sessionThatKeeps(fakeSession('UNCHANGED-1', received), 'session-root', setup, {});
        cy.then(() => expect(received.setup).to.equal(setup));
        cy.then(() => afterSpec());
    });

    it('keeps a session that cy.session() restored without running its setup, and logs it out when the spec ends', () => {
        sessionThatKeeps(fakeSession('KEPT-1', {}), 'session-root', () => undefined, {});
        cy.then(() => afterTest());
        cy.then(() => expect(logoutCalls).to.deep.equal([]));
        cy.then(() => afterSpec());
        cy.then(() => expect(logoutCalls).to.deep.equal(['POST /cms/logout KEPT-1']));
    });

    it('keeps a session that cy.session() caches across specs, also when the spec ends', () => {
        sessionThatKeeps(fakeSession('ACROSS-1', {}), 'session-root', () => undefined, {cacheAcrossSpecs: true});
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

        it('logs out each session that the tests shared when the spec ends', () => {
            cy.setCookie(COOKIE, 'SHARED-A', {domain: 'localhost'});
            cy.then(() => afterTest());
            cy.setCookie(COOKIE, 'SHARED-B', {domain: 'localhost'});
            cy.then(() => afterTest());
            cy.then(() => afterSpec());
            cy.then(() => expect(logoutCalls).to.deep.equal(['POST /cms/logout SHARED-A', 'POST /cms/logout SHARED-B']));
        });
    });
});
