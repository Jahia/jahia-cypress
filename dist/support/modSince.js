"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modSince = exports.registerVersionSupport = exports.initializeVersionSupport = exports.JAHIA_VERSION_ENV_VAR = void 0;
var compare_versions_1 = require("compare-versions");
// Intentionally keep explicit path to avoid edge case errors in runtime
var JahiaPlatformHelper_1 = require("../utils/JahiaPlatformHelper");
/** Cypress environment variable key used to store the current Jahia version. */
exports.JAHIA_VERSION_ENV_VAR = 'CYPRESS_JAHIA_VERSION';
// ─── Internal helpers ────────────────────────────────────────────────────────
/**
 * Returns `true` when `current` satisfies `>= required`.
 * Treats missing, empty, or unparseable versions as unsupported.
 * @param current - The running Jahia version read from `Cypress.env`.
 * @param required - Minimum version the test or suite needs.
 */
var isSupported = function (current, required) {
    if (!(current === null || current === void 0 ? void 0 : current.trim())) {
        return false;
    }
    try {
        return (0, compare_versions_1.compare)(String(current), required, '>=');
    }
    catch (_a) {
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
var assertArgs = function (version, title, scope) {
    if (!(0, compare_versions_1.validate)(version)) {
        var hint = (0, compare_versions_1.validate)(title) ? ' (arguments appear swapped)' : '';
        throw new Error("[".concat(scope, "] Invalid version: \"").concat(version, "\"").concat(hint, "."));
    }
};
/**
 * Builds a human-readable message explaining why a test or suite was skipped.
 * @param scope - Label for the helper (e.g. `"it.since"` or `"describe.since"`).
 * @param title - Original test or suite title.
 * @param required - Minimum version the test or suite needs.
 * @param current - The running Jahia version; `undefined` when not yet fetched.
 */
var skipReason = function (scope, title, required, current) {
    return current ?
        "[".concat(scope, "] Skipping \"").concat(title, "\" \u2014 ").concat(exports.JAHIA_VERSION_ENV_VAR, "=\"").concat(current, "\" < required ").concat(required, ".") :
        "[".concat(scope, "] Skipping \"").concat(title, "\" \u2014 ").concat(exports.JAHIA_VERSION_ENV_VAR, " is not set. Required: ").concat(required, ".");
};
// ─── Public API ───────────────────────────────────────────────────────────────
/**
 * Fetches the Jahia version from the GraphQL API, strips the `-SNAPSHOT` suffix,
 * and caches the result in `Cypress.env(JAHIA_VERSION_ENV_VAR)`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var initializeVersionSupport = function () {
    var cachedVersion = Cypress.env(exports.JAHIA_VERSION_ENV_VAR);
    if (typeof cachedVersion === 'string' && cachedVersion.trim() !== '') {
        return cy.wrap(cachedVersion, { log: false });
    }
    return (0, JahiaPlatformHelper_1.getJahiaVersion)().then(function (jahiaVersion) {
        var _a;
        var version = ((_a = jahiaVersion === null || jahiaVersion === void 0 ? void 0 : jahiaVersion.release) === null || _a === void 0 ? void 0 : _a.replace('-SNAPSHOT', '')) || '0.0.0.1';
        Cypress.env(exports.JAHIA_VERSION_ENV_VAR, version);
        return version;
    });
};
exports.initializeVersionSupport = initializeVersionSupport;
/**
 * Attaches `.since()` to `it`, `it.only`, `it.skip`, `describe`, `describe.only`,
 * and `describe.skip`. Safe to call multiple times — subsequent calls are no-ops.
 */
var registerVersionSupport = function () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var mochaIt = globalThis.it;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var mochaDescribe = globalThis.describe;
    if (!mochaIt) {
        throw new Error('Unable to register version support because Mocha `it` is not available.');
    }
    if (!mochaDescribe) {
        throw new Error('Unable to register version support because Mocha `describe` is not available.');
    }
    var _loop_1 = function (target) {
        if (typeof target.since === 'function') {
            return "continue";
        }
        var isSkip = target === mochaIt.skip;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        target.since = function (version, title, configOrFn, maybeFn) {
            assertArgs(version, title, 'it.since');
            if (isSkip) {
                // It.skip.since: always skip unconditionally, preserve the title
                return typeof configOrFn === 'function' || configOrFn === undefined ?
                    target(title, configOrFn) :
                    target(title, configOrFn, maybeFn);
            }
            var userFn = typeof configOrFn === 'function' ? configOrFn : maybeFn;
            var wrappedFn = function () {
                var current = Cypress.env(exports.JAHIA_VERSION_ENV_VAR);
                if (!isSupported(current, version)) {
                    console.warn(skipReason('it.since', title, version, current));
                    this.skip();
                }
                else if (typeof userFn === 'function') {
                    return userFn.call(this);
                }
            };
            return typeof configOrFn === 'object' && configOrFn !== null ?
                target(title, configOrFn, wrappedFn) :
                target(title, wrappedFn);
        };
    };
    // Attach .since() to it / it.only / it.skip
    for (var _i = 0, _a = [mochaIt, mochaIt.only, mochaIt.skip]; _i < _a.length; _i++) {
        var target = _a[_i];
        _loop_1(target);
    }
    var _loop_2 = function (target) {
        if (typeof target.since === 'function') {
            return "continue";
        }
        var isSkip = target === mochaDescribe.skip;
        target.since = function (version, title, fn) {
            assertArgs(version, title, 'describe.since');
            if (isSkip) {
                // Describe.skip.since: always skip unconditionally, preserve the title
                return target(title, fn);
            }
            return target(title, function () {
                // Suite-level runtime check runs after the global before() has fetched the version
                before(function () {
                    var current = Cypress.env(exports.JAHIA_VERSION_ENV_VAR);
                    if (!isSupported(current, version)) {
                        console.warn(skipReason('describe.since', title, version, current));
                        this.skip();
                    }
                });
                fn.call(this);
            });
        };
    };
    // Attach .since() to describe / describe.only / describe.skip
    for (var _b = 0, _c = [mochaDescribe, mochaDescribe.only, mochaDescribe.skip]; _b < _c.length; _b++) {
        var target = _c[_b];
        _loop_2(target);
    }
    // Compatibility shim: redirect accidental it.skip(version, title, fn) → it.skip.since(...)
    var origItSkip = mochaIt.skip;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mochaIt.skip = Object.assign(function (title, configOrTitle, maybeFn) {
        if ((0, compare_versions_1.validate)(title) && typeof configOrTitle === 'string' && typeof maybeFn === 'function') {
            return origItSkip.since(title, configOrTitle, maybeFn);
        }
        return typeof configOrTitle === 'function' || configOrTitle === undefined ?
            origItSkip(title, configOrTitle) :
            origItSkip(title, configOrTitle, maybeFn);
    }, { since: origItSkip.since });
    var origDescribeSkip = mochaDescribe.skip;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mochaDescribe.skip = Object.assign(function (title, fnOrTitle, maybeFn) {
        if ((0, compare_versions_1.validate)(title) && typeof fnOrTitle === 'string' && typeof maybeFn === 'function') {
            return origDescribeSkip.since(title, fnOrTitle, maybeFn);
        }
        return origDescribeSkip(title, fnOrTitle);
    }, { since: origDescribeSkip.since });
};
exports.registerVersionSupport = registerVersionSupport;
/**
 * Enables version-gated testing for the Cypress suite.
 * Registers `it.since`, `describe.since` (and their `.only`/`.skip` variants),
 * then fetches the running Jahia version in a root `before()` hook.
 *
 * @example
 * it.since('8.2.0', 'works on 8.2+', () => { ... });
 * describe.since('8.2.0', 'suite for 8.2+', () => { ... });
 */
function enable() {
    (0, exports.registerVersionSupport)();
    before(function () { return (0, exports.initializeVersionSupport)(); });
}
/** Public API for Jahia version-gated testing. */
exports.modSince = { enable: enable };
