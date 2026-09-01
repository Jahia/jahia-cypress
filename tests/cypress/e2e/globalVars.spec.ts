import {GlobalVarValue} from '../../../src/plugins/globalVars';
import {getGlobalVar, setGlobalVar} from '../../../src/support/globalVars';

// Asserts that setGlobalVar() rejects `value` with the expected validation error.
// Uses the done callback so the test only passes if cy.task actually fails -
// if a regression lets an invalid value through, the test times out instead of
// silently passing.
const expectRejected = (key: string, value: unknown, done: Mocha.Done) => {
    cy.on('fail', err => {
        expect(err.message).to.contain(`setGlobalVar('${key}')`);
        expect(err.message).to.contain('only finite string/number/boolean values can be stored');
        done();
    });
    setGlobalVar(key, value as GlobalVarValue);
};

describe('globalVars', () => {
    it('returns null for a key that was never set', () => {
        getGlobalVar('NEVER_SET_KEY').should('be.null');
    });

    it('round-trips a value set earlier in the same spec', () => {
        setGlobalVar('ROUNDTRIP_KEY', 'hello');
        getGlobalVar('ROUNDTRIP_KEY').should('eq', 'hello');
    });

    describe('accepted value types', () => {
        it('round-trips a string value', () => {
            setGlobalVar('STRING_KEY', 'a string');
            getGlobalVar('STRING_KEY').should('eq', 'a string');
        });

        it('round-trips a true boolean value', () => {
            setGlobalVar('BOOL_TRUE_KEY', true);
            getGlobalVar('BOOL_TRUE_KEY').should('eq', true);
        });

        it('round-trips a false boolean value', () => {
            setGlobalVar('BOOL_FALSE_KEY', false);
            getGlobalVar('BOOL_FALSE_KEY').should('eq', false);
        });

        it('round-trips a finite number value', () => {
            setGlobalVar('NUMBER_KEY', 42.5);
            getGlobalVar('NUMBER_KEY').should('eq', 42.5);
        });

        it('round-trips zero', () => {
            setGlobalVar('ZERO_KEY', 0);
            getGlobalVar('ZERO_KEY').should('eq', 0);
        });

        it('round-trips a negative finite number value', () => {
            setGlobalVar('NEGATIVE_NUMBER_KEY', -42.5);
            getGlobalVar('NEGATIVE_NUMBER_KEY').should('eq', -42.5);
        });
    });

    describe('rejected value types', () => {
        it('rejects NaN', done => {
            expectRejected('NAN_KEY', NaN, done);
        });

        it('rejects Infinity', done => {
            expectRejected('INFINITY_KEY', Infinity, done);
        });

        it('rejects -Infinity', done => {
            expectRejected('NEG_INFINITY_KEY', -Infinity, done);
        });

        it('rejects null', done => {
            expectRejected('NULL_KEY', null, done);
        });

        it('rejects undefined', done => {
            expectRejected('UNDEFINED_KEY', undefined, done);
        });

        it('rejects a plain object', done => {
            expectRejected('OBJECT_KEY', {foo: 'bar'}, done);
        });

        it('rejects an array', done => {
            expectRejected('ARRAY_KEY', [1, 2, 3], done);
        });
    });
});
