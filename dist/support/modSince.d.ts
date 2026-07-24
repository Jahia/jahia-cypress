/** Cypress environment variable key used to store the current Jahia version. */
export declare const JAHIA_VERSION_ENV_VAR = "CYPRESS_JAHIA_VERSION";
declare global {
    namespace Mocha {
        interface TestFunction {
            since(requiredVersion: string, title: string, fn?: Func): Test;
            since(requiredVersion: string, title: string, config: Cypress.TestConfigOverrides, fn?: Func): Test;
        }
        interface ExclusiveTestFunction {
            since(requiredVersion: string, title: string, fn?: Func): Test;
            since(requiredVersion: string, title: string, config: Cypress.TestConfigOverrides, fn?: Func): Test;
        }
        interface PendingTestFunction {
            since(requiredVersion: string, title: string, fn?: Func): Test;
            since(requiredVersion: string, title: string, config: Cypress.TestConfigOverrides, fn?: Func): Test;
        }
        interface SuiteFunction {
            since(requiredVersion: string, title: string, fn: (this: Suite) => void): Suite;
        }
        interface ExclusiveSuiteFunction {
            since(requiredVersion: string, title: string, fn: (this: Suite) => void): Suite;
        }
        interface PendingSuiteFunction {
            since(requiredVersion: string, title: string, fn: (this: Suite) => void): Suite;
        }
    }
}
/**
 * Fetches the Jahia version from the GraphQL API, strips the `-SNAPSHOT` suffix,
 * and caches the result in `Cypress.env(JAHIA_VERSION_ENV_VAR)`.
 */
export declare const initializeVersionSupport: () => Cypress.Chainable<any>;
/**
 * Attaches `.since()` to `it`, `it.only`, `it.skip`, `describe`, `describe.only`,
 * and `describe.skip`. Safe to call multiple times — subsequent calls are no-ops.
 */
export declare const registerVersionSupport: () => void;
/**
 * Enables version-gated testing for the Cypress suite.
 * Registers `it.since`, `describe.since` (and their `.only`/`.skip` variants),
 * then fetches the running Jahia version in a root `before()` hook.
 *
 * @example
 * it.since('8.2.0', 'works on 8.2+', () => { ... });
 * describe.since('8.2.0', 'suite for 8.2+', () => { ... });
 */
declare function enable(): void;
/** Public API for Jahia version-gated testing. */
export declare const modSince: {
    enable: typeof enable;
};
export {};
