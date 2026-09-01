import {getGlobalVar} from '../../../src/support/globalVars';

// Pairs with globalVarsCrossSpecA.spec.ts, which must run first. Cypress orders specs alphabetically.
// Running this file alone will fail by design.
describe('globalVars (cross-spec, part B)', () => {
    it('reads the value set by an earlier spec file in the same run', () => {
        getGlobalVar('CROSS_SPEC_KEY').should('eq', 'set-in-spec-a');
    });
});
