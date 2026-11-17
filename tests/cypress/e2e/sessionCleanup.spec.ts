import {shouldLogout} from '../../../src/support/sessionCleanup';

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
