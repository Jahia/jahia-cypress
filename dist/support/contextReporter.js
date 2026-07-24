"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.context = void 0;
exports.collect = collect;
/* eslint-disable @typescript-eslint/no-explicit-any */
var addContext_1 = __importDefault(require("mochawesome/addContext"));
/**
 * Tag a test suite or individual test.
 *
 * Tags are user-defined labels that provide metadata about tests. They are collected during
 * test execution and synchronized to TestRail test cases by jahia-reporter, enabling filtering,
 * categorization, and custom dashboard reporting.
 *
 * - Call inside `describe()` to tag every test in the suite (tags are inherited by all nested tests).
 * - Call inside `it()` to tag only that specific test.
 *
 * Tags are:
 * - Collected and stored in the mochawesome report under each test's `context` field
 * - Automatically synced to TestRail by jahia-reporter for dashboard and filtering
 * - Deduplicated (each unique tag appears once per test)
 * - Inherited by nested describe blocks
 *
 * @param {string[]} tags - array of tags to be added
 * @return {void}
 *
 * @example
 * import {context} from '@jahia/cypress';
 * describe('My suite', () => {
 *   context.tag('smoke', 'regression', 'p0');
 *
 *   it('my test', () => {
 *     context.tag('critical');
 *     // effective tags: ['smoke', 'regression', 'p0', 'critical']
 *   });
 * });
 *
 * @see docs/context-reporter.md for details
 */
function tag() {
    var _a;
    var tags = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        tags[_i] = arguments[_i];
    }
    if (Cypress.currentTest) {
        // Inside it() — Cypress is running a test, attach tags directly to the Mocha runnable
        var runnable = cy.state('runnable');
        runnable._tags = __spreadArray(__spreadArray([], ((_a = runnable._tags) !== null && _a !== void 0 ? _a : []), true), tags, true);
    }
    else {
        // Inside describe() — collection phase, schedule a before() hook to tag the suite
        before(function () {
            var _a, _b;
            var suite = (_a = this.currentTest) === null || _a === void 0 ? void 0 : _a.parent;
            if (suite) {
                var taggedSuite = suite;
                taggedSuite._tags = __spreadArray(__spreadArray([], ((_b = taggedSuite._tags) !== null && _b !== void 0 ? _b : []), true), tags, true);
            }
        });
    }
}
/**
 * Internal function to collect all tags upon 'test:after:run' event and add them to the mochawesome context.
 *
 * Walks up the suite chain to collect inherited tags and combines them with test-specific tags.
 * The collected tags are added to the test context in the mochawesome report, where jahia-reporter
 * can extract them and sync to the corresponding TestRail test case.
 *
 * @param test
 * @param runnable
 * @internal to be used in registerSupport only
 */
function collect(test, runnable) {
    var _a, _b;
    var taggedRunnable = runnable;
    // Add video context
    // addContext({test}, {title: 'video', value: `videos/${Cypress.spec.relative.replace('/.cy.*', '').replace('cypress/e2e/', '')}.mp4`});
    // Walk up the suite chain (outermost first) to collect inherited suite tags
    var suiteTags = [];
    var parent = taggedRunnable.parent;
    while (parent) {
        if ((_a = parent._tags) === null || _a === void 0 ? void 0 : _a.length) {
            suiteTags.unshift.apply(suiteTags, parent._tags);
        }
        parent = parent.parent;
    }
    // Collect all unique tags (suite + test) and add to context
    var allTags = Array.from(new Set(__spreadArray(__spreadArray([], suiteTags, true), ((_b = taggedRunnable._tags) !== null && _b !== void 0 ? _b : []), true)));
    if (allTags.length > 0) {
        (0, addContext_1.default)({ test: test }, { title: 'tags', value: allTags });
    }
    // Add screenshot context if test failed
    // if (test.state === 'failed') {
    //     addContext({test}, {title: 'screenshot', value: `screenshots/${Cypress.spec.relative.replace('cypress/e2e/', '')}/${runnable.parent.title} -- ${test.title} (failed).png`});
    // }
}
/** Public export */
exports.context = { tag: tag };
