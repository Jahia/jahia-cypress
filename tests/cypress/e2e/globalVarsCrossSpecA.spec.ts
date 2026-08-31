import {setGlobalVar} from '../../../src/support/globalVars'

describe('globalVars (cross-spec, part A)', () => {
    it('sets a value for a later spec file to read', () => {
        setGlobalVar('CROSS_SPEC_KEY', 'set-in-spec-a')
    })
})
