import {compare} from 'compare-versions';
// Intentionally keep explicit path to avoid edge case errors in runtime
import {getJahiaVersion} from '../utils/JahiaPlatformHelper';

/** Cypress environment variable key used to store the current Jahia version. */
export const JAHIA_VERSION_ENV_VAR = 'JAHIA_VERSION';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Mocha {
        interface TestFunction {
            since(requiredVersion: string, title: string, fn?: Func): Test;
            since(requiredVersion: string, title: string, config: Cypress.TestConfigOverrides, fn?: Func): Test;
        }

        interface ExclusiveTestFunction {
            since(requiredVersion: string, title: string, fn?: Func): Test;
            since(requiredVersion: string, title: string, config: Cypress.TestConfigOverrides, fn?: Func): Test;
        }
    }
}

/**
 * Overloaded call signature for the `it.since` helper.
 * Mirrors Mocha's own `TestFunction` overloads but adds `requiredVersion` as the first argument.
 */
type SinceFunction = {
    (requiredVersion: string, title: string, fn?: Mocha.Func): Mocha.Test;
    (requiredVersion: string, title: string, config: Cypress.TestConfigOverrides, fn?: Mocha.Func): Mocha.Test;
};

/**
 * Augmented Mocha `TestFunction` that carries the optional `since` property
 * after `registerVersionSupport()` has been called.
 */
type ItWithSince = Mocha.TestFunction & {
    since?: SinceFunction;
    only: Mocha.ExclusiveTestFunction & {
        since?: SinceFunction;
    };
};

/**
 * Returns `true` when `version` is a non-empty, non-null value.
 * @param version - Value to test.
 */
const isValidString = (version: string | number | undefined): boolean => {
    return typeof version !== 'undefined' && version !== null && String(version).trim() !== '';
};

/**
 * Returns `true` when `currentVersion` satisfies `>= requiredVersion`.
 * Invalid or missing versions are treated as unsupported.
 * @param currentVersion - The running Jahia version (from `Cypress.env`).
 * @param requiredVersion - Minimum version the test needs.
 */
const isVersionSupported = (currentVersion: string | number | undefined, requiredVersion: string): boolean => {
    if (!isValidString(currentVersion)) {
        return false;
    }

    try {
        return compare(String(currentVersion), requiredVersion, '>=');
    } catch {
        return false;
    }
};

/**
 * Builds a human-readable message explaining why a test was skipped.
 * The message differs depending on whether the version is missing or simply too low.
 * @param title - Original test title.
 * @param requiredVersion - Minimum version the test needs.
 * @param currentVersion - The running Jahia version (from `Cypress.env`).
 */
const getSkipMessage = (title: string, requiredVersion: string, currentVersion: string | number | undefined): string => {
    if (!isValidString(currentVersion)) {
        return `[it.since] Skipping "${title}" because ${JAHIA_VERSION_ENV_VAR} is empty or undefined. Required version: ${requiredVersion}.`;
    }

    return `[it.since] Skipping "${title}" because ${JAHIA_VERSION_ENV_VAR}="${String(currentVersion)}" does not satisfy required version ${requiredVersion}.`;
};

/**
 * Fetches the Jahia version from the GraphQL API, strips the `-SNAPSHOT` suffix when
 * present, and caches the result in `Cypress.env(JAHIA_VERSION_ENV_VAR)`.
 *
 * @returns A Cypress chainable that resolves to the normalized version string (e.g. `"8.2.0"`).
 */
export const initializeVersionSupport = (): Cypress.Chainable => {
    return getJahiaVersion().then(jahiaVersion => {
        const version = jahiaVersion.release.replace('-SNAPSHOT', '');
        Cypress.env(JAHIA_VERSION_ENV_VAR, version);
        return version;
    });
};

/**
 * Attaches the `since` helper to Mocha's global `it` function.
 * Safe to call multiple times — subsequent calls are no-ops when `it.since` already exists.
 *
 * The version check is evaluated at test runtime in the wrapped `it.since` body.
 * This allows logging skip reasons immediately before a test is marked pending.
 *
 * @throws {Error} If Mocha's `it` is not available in the current context.
 */
export const registerVersionSupport = (): void => {
    const mochaIt = globalThis.it as ItWithSince | undefined;

    if (!mochaIt) {
        throw new Error('Unable to register version support because Mocha `it` is not available.');
    }

    const attachSince = (target: (Mocha.TestFunction | Mocha.ExclusiveTestFunction) & {since?: SinceFunction}): void => {
        if (typeof target.since === 'function') {
            return;
        }

        target.since = ((requiredVersion: string, title: string, configOrFn?: Cypress.TestConfigOverrides | Mocha.Func, maybeFn?: Mocha.Func): Mocha.Test => {
            const originalFn = (typeof configOrFn === 'function' || typeof configOrFn === 'undefined') ?
                configOrFn as Mocha.Func | undefined : maybeFn;

            const wrappedFn: Mocha.Func = function (this: Mocha.Context) {
                const currentVersion = Cypress.env(JAHIA_VERSION_ENV_VAR);
                if (!isVersionSupported(currentVersion, requiredVersion)) {
                    console.warn(getSkipMessage(title, requiredVersion, currentVersion));
                    this.skip();
                } else if (typeof originalFn === 'function') {
                    return originalFn.call(this);
                }
            };

            if (typeof configOrFn === 'function' || typeof configOrFn === 'undefined') {
                return target(title, wrappedFn);
            }

            return target(title, configOrFn, wrappedFn);
        }) as SinceFunction;
    };

    attachSince(mochaIt);
    attachSince(mochaIt.only);
};

/**
 * Enables version-gated testing support for a Cypress suite.
 *
 * Version is fetched in a root `before()` hook.
 * `it.since(...)` evaluates support at runtime and logs the skip reason immediately
 * before marking the test pending.
 *
 * @example
 * // any spec file — no import needed
 * it.since('8.2.0', 'feature added in 8.2', () => { ... });
 */
function enable(): void {
    registerVersionSupport();

    before(() => {
        return initializeVersionSupport();
    });
}

/**
 * Public API for Jahia version-gated testing.
 */
export const itSince = {
    enable
};
