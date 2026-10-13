import {satisfies, validate} from 'compare-versions';
// Intentionally keep explicit path to avoid edge case errors in runtime
import {JAHIA_VERSION_ENV_VAR, cacheJahiaRelease, getJahiaVersion, resolveJahiaRelease} from '../utils/JahiaPlatformHelper';

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
 * Turns a `since()` requirement into a compare-versions range. A plain version is a minimum, so
 * `'8.2.4.0'` reads `'>=8.2.4.0'` as before; anything else is a range, e.g. `'<8.2.4'` or
 * `'>=8.1.9.5 <8.2.0 || >=8.2.3.5'`.
 * @param required - The version or range given to `since()`.
 */
const toRange = (required: string): string => (validate(required) ? `>=${required}` : required);

/**
 * Returns `true` when `required` is a plain version or a range compare-versions can read.
 * @param required - The version or range given to `since()`.
 */
const isValidRequirement = (required: string): boolean => {
    try {
        satisfies('0.0.0', toRange(required));
        return true;
    } catch {
        return false;
    }
};

/**
 * Returns `true` when the cached Jahia release satisfies `required`, a plain version read as a minimum or a range.
 * Treats a missing or unparseable release as unsupported.
 * @param required - The version or range the test or suite needs.
 */
const isSupported = (required: string): boolean => {
    const current = resolveJahiaRelease();
    if (!current) {
        return false;
    }

    try {
        return satisfies(current, toRange(required));
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
    if (!isValidRequirement(version)) {
        const hint = isValidRequirement(title) ? ' (arguments appear swapped)' : '';
        throw new Error(`[${scope}] Invalid version: "${version}"${hint}.`);
    }
};

/**
 * Builds a human-readable message explaining why a test or suite was skipped.
 * @param scope - Label for the helper (e.g. `"it.since"` or `"describe.since"`).
 * @param title - Original test or suite title.
 * @param required - The version or range the test or suite needs; the message reads the cached release itself.
 */
const skipReason = (scope: string, title: string, required: string): string => {
    const current = resolveJahiaRelease();
    return current ?
        `[${scope}] Skipping "${title}" — ${JAHIA_VERSION_ENV_VAR}="${current}" does not satisfy ${toRange(required)}.` :
        `[${scope}] Skipping "${title}" — ${JAHIA_VERSION_ENV_VAR} is not set. Required: ${required}.`;
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the cached Jahia release, or fetches it from the GraphQL API and caches it without the
 * `-SNAPSHOT` suffix. Caches nothing when GraphQL reports no release: an empty cache skips every
 * gated test, while a placeholder release would run the ones gated on an upper bound such as '<8.2.4'.
 * @returns The release, e.g. '8.2.3.0', or undefined when none could be fetched.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const initializeVersionSupport = (): Cypress.Chainable<any> => {
    const cachedRelease = resolveJahiaRelease();
    if (cachedRelease) {
        return cy.wrap(cachedRelease, {log: false});
    }

    return getJahiaVersion().then(version => {
        if (version?.release) {
            cacheJahiaRelease(version.release);
        }

        // Wrapped, because a then() callback that returns undefined yields the previous subject instead
        return cy.wrap(resolveJahiaRelease(), {log: false});
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
                if (!isSupported(version)) {
                    console.warn(skipReason('it.since', title, version));
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
                    if (!isSupported(version)) {
                        console.warn(skipReason('describe.since', title, version));
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
