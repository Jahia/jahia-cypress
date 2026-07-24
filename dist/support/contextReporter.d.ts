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
declare function tag(...tags: string[]): void;
/** Public export */
export declare const context: {
    tag: typeof tag;
};
export {};
