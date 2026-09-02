import {compare, validate} from 'compare-versions';
// Intentionally keep explicit path to avoid edge case errors in runtime
import {getJahiaVersion} from '../utils/JahiaPlatformHelper';

/** Cypress environment variable key used to store the current Jahia version. */
export const JAHIA_VERSION_ENV_VAR = 'CYPRESS_JAHIA_VERSION';

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

// ─── Internal helpers ────────────────────────────────────────────────────────

/**
 * Returns `true` when `current` satisfies `>= required`.
 * Treats missing, empty, or unparseable versions as unsupported.
 * @param current - The running Jahia version read from `Cypress.env`.
 * @param required - Minimum version the test or suite needs.
 */
const isSupported = (current: string | undefined, required: string): boolean => {
    if (!current?.trim()) {
        return false;
    }

    try {
        return compare(String(current), required, '>=');
    } catch {
        return false;
    }
};

/**
 * Validates `since(...)` arguments and throws a descriptive error on misuse.
 * Detects the common mistake of swapping `requiredVersion` and `title`.
 * @param version - Version string passed as the first argument.
 * @param title - Title string passed as the second argument.
 * @param scope - Label used in the error message (e.g. `"it.since"`).
 */
const assertArgs = (version: string, title: string, scope: string): void => {
    if (!validate(version)) {
        const hint = validate(title) ? ' (arguments appear swapped)' : '';
        throw new Error(`[${scope}] Invalid version: "${version}"${hint}.`);
    }
};

/**
 * Builds a human-readable message explaining why a test or suite was skipped.
 * @param scope - Label for the helper (e.g. `"it.since"` or `"describe.since"`).
 * @param title - Original test or suite title.
 * @param required - Minimum version the test or suite needs.
 * @param current - The running Jahia version; `undefined` when not yet fetched.
 */
const skipReason = (scope: string, title: string, required: string, current?: string): string =>
    current ?
        `[${scope}] Skipping "${title}" — ${JAHIA_VERSION_ENV_VAR}="${current}" < required ${required}.` :
        `[${scope}] Skipping "${title}" — ${JAHIA_VERSION_ENV_VAR} is not set. Required: ${required}.`;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetches the Jahia version from the GraphQL API, strips the `-SNAPSHOT` suffix,
 * and caches the result in `Cypress.env(JAHIA_VERSION_ENV_VAR)`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const initializeVersionSupport = (): Cypress.Chainable<any> => {
    const cachedVersion = Cypress.env(JAHIA_VERSION_ENV_VAR);

    if (typeof cachedVersion === 'string' && cachedVersion.trim() !== '') {
        return cy.wrap(cachedVersion, {log: false});
    }

    return getJahiaVersion().then(jahiaVersion => {
        const version = jahiaVersion?.release?.replace('-SNAPSHOT', '') || '0.0.0.1';
        Cypress.env(JAHIA_VERSION_ENV_VAR, version);
        return version;
    });
};

/**
 * Attaches `.since()` to `it`, `it.only`, `it.skip`, `describe`, `describe.only`,
 * and `describe.skip`. Safe to call multiple times — subsequent calls are no-ops.
 */
export const registerVersionSupport = (): void => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mochaIt = globalThis.it as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mochaDescribe = globalThis.describe as any;

    if (!mochaIt) {
        throw new Error('Unable to register version support because Mocha `it` is not available.');
    }

    if (!mochaDescribe) {
        throw new Error('Unable to register version support because Mocha `describe` is not available.');
    }

    // Attach .since() to it / it.only / it.skip
    for (const target of [mochaIt, mochaIt.only, mochaIt.skip]) {
        if (typeof target.since === 'function') {
            continue;
        }

        const isSkip = target === mochaIt.skip;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        target.since = (version: string, title: string, configOrFn?: any, maybeFn?: any) => {
            assertArgs(version, title, 'it.since');

            if (isSkip) {
                // It.skip.since: always skip unconditionally, preserve the title
                return typeof configOrFn === 'function' || configOrFn === undefined ?
                    target(title, configOrFn) :
                    target(title, configOrFn, maybeFn);
            }

            const userFn = typeof configOrFn === 'function' ? configOrFn : maybeFn;
            const wrappedFn = function (this: Mocha.Context) {
                const current = Cypress.env(JAHIA_VERSION_ENV_VAR);
                if (!isSupported(current, version)) {
                    console.warn(skipReason('it.since', title, version, current));
                    this.skip();
                } else if (typeof userFn === 'function') {
                    return userFn.call(this);
                }
            };

            return typeof configOrFn === 'object' && configOrFn !== null ?
                target(title, configOrFn, wrappedFn) :
                target(title, wrappedFn);
        };
    }

    // Attach .since() to describe / describe.only / describe.skip
    for (const target of [mochaDescribe, mochaDescribe.only, mochaDescribe.skip]) {
        if (typeof target.since === 'function') {
            continue;
        }

        const isSkip = target === mochaDescribe.skip;
        target.since = (version: string, title: string, fn: (this: Mocha.Suite) => void) => {
            assertArgs(version, title, 'describe.since');

            if (isSkip) {
                // Describe.skip.since: always skip unconditionally, preserve the title
                return target(title, fn);
            }

            return target(title, function (this: Mocha.Suite) {
                // Suite-level runtime check runs after the global before() has fetched the version
                before(function (this: Mocha.Context) {
                    const current = Cypress.env(JAHIA_VERSION_ENV_VAR);
                    if (!isSupported(current, version)) {
                        console.warn(skipReason('describe.since', title, version, current));
                        this.skip();
                    }
                });

                fn.call(this);
            });
        };
    }

    // Compatibility shim: redirect accidental it.skip(version, title, fn) → it.skip.since(...)
    const origItSkip = mochaIt.skip;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mochaIt.skip = Object.assign((title: string, configOrTitle?: any, maybeFn?: any) => {
        if (validate(title) && typeof configOrTitle === 'string' && typeof maybeFn === 'function') {
            return origItSkip.since(title, configOrTitle, maybeFn);
        }

        return typeof configOrTitle === 'function' || configOrTitle === undefined ?
            origItSkip(title, configOrTitle) :
            origItSkip(title, configOrTitle, maybeFn);
    }, {since: origItSkip.since});

    const origDescribeSkip = mochaDescribe.skip;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mochaDescribe.skip = Object.assign((title: string, fnOrTitle?: any, maybeFn?: any) => {
        if (validate(title) && typeof fnOrTitle === 'string' && typeof maybeFn === 'function') {
            return origDescribeSkip.since(title, fnOrTitle, maybeFn);
        }

        return origDescribeSkip(title, fnOrTitle);
    }, {since: origDescribeSkip.since});
};

/**
 * Enables version-gated testing for the Cypress suite.
 * Registers `it.since`, `describe.since` (and their `.only`/`.skip` variants),
 * then fetches the running Jahia version in a root `before()` hook.
 *
 * @example
 * it.since('8.2.0', 'works on 8.2+', () => { ... });
 * describe.since('8.2.0', 'suite for 8.2+', () => { ... });
 */
function enable(): void {
    registerVersionSupport();
    before(() => initializeVersionSupport());
}

/** Public API for Jahia version-gated testing. */
export const modSince = {enable};
