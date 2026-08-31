import {TASK_GET_GLOBAL_VAR, TASK_SET_GLOBAL_VAR} from '../plugins/globalVars';

/**
 * Read a value from the cross-spec key/value store (see `registerGlobalVarsTasks()`), which
 * lives in the Node plugins process rather than the browser, so it survives across spec files
 * within the same `cypress run` — unlike `Cypress.env()`, which resets on every spec's reload.
 * @param {string} key the key the value was stored under via `setGlobalVar()`
 * @returns {Cypress.Chainable<T | null>} the stored value, or null if never set
 */
export function getGlobalVar<T = unknown>(key: string): Cypress.Chainable<T | null> {
    return cy.task(TASK_GET_GLOBAL_VAR, key);
}

/**
 * Write a value into the cross-spec key/value store (see `getGlobalVar()`).
 * @param {string} key the key to store the value under
 * @param {T} value the value to store
 */
export function setGlobalVar<T = unknown>(key: string, value: T): Cypress.Chainable<null> {
    return cy.task(TASK_SET_GLOBAL_VAR, {key, value});
}
