import {getGlobalVar, setGlobalVar} from '../../../src/support/globalVars'

describe('globalVars', () => {
    it('returns null for a key that was never set', () => {
        getGlobalVar('NEVER_SET_KEY').should('be.null')
    })

    it('round-trips a value set earlier in the same spec', () => {
        setGlobalVar('ROUNDTRIP_KEY', 'hello')
        getGlobalVar('ROUNDTRIP_KEY').should('eq', 'hello')
    })
})
