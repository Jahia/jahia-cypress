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
            // Another layer of type checking to ensure that the value is a safe one.
            const isPrimitive = typeof value === 'string' || typeof value === 'boolean' ||
                (typeof value === 'number' && Number.isFinite(value));

            // Throw an error if the value is not a finite string, number, or boolean.
            // This prevents storing objects, arrays, or functions.
            if (!isPrimitive) {
                throw new TypeError(
                    `setGlobalVar('${key}'): only finite string/number/boolean values can be stored, got ${String(value)}`
                );
            }

            globalVars[key] = value;
            return null;
        }
    });
};
