export type GlobalVarValue = string | number | boolean;

const globalVars: Record<string, GlobalVarValue> = {};

export const TASK_GET_GLOBAL_VAR = 'jahiaCypressGetGlobalVar';
export const TASK_SET_GLOBAL_VAR = 'jahiaCypressSetGlobalVar';

/**
 * Registers generic `cy.task()` handlers backed by a key/value store in the Node plugins
 * process. Unlike `Cypress.env()`, that process stays alive for the whole `cypress run`, so a
 * value set here survives across spec files instead of resetting on every spec's page reload.
 * Values are restricted to primitives (string/number/boolean) — no objects, arrays or functions.
 */
export const registerGlobalVarsTasks = (on: Cypress.PluginEvents): void => {
    on('task', {
        [TASK_GET_GLOBAL_VAR]: (key: string) => globalVars[key] ?? null,
        [TASK_SET_GLOBAL_VAR]: ({key, value}: {key: string; value: GlobalVarValue}) => {
            globalVars[key] = value;
            return null;
        }
    });
};
