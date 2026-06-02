/* eslint-disable @typescript-eslint/no-explicit-any */
import addContext from 'mochawesome/addContext';

type TaggedRunnable = Mocha.Runnable & {_tags?: string[]};
type TaggedSuite = Mocha.Suite & {_tags?: string[]};

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
function tag(...tags: string[]): void {
    if (Cypress.currentTest) {
        // Inside it() — Cypress is running a test, attach tags directly to the Mocha runnable
        const runnable = (cy as any).state('runnable') as TaggedRunnable;
        runnable._tags = [...(runnable._tags ?? []), ...tags];
    } else {
        // Inside describe() — collection phase, schedule a before() hook to tag the suite
        before(function () {
            const suite = this.currentTest?.parent;
            if (suite) {
                const taggedSuite = suite as TaggedSuite;
                taggedSuite._tags = [...(taggedSuite._tags ?? []), ...tags];
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
export function collect(test: any, runnable: any): void {
    const taggedRunnable = runnable as TaggedRunnable;
    // Add video context
    // addContext({test}, {title: 'video', value: `videos/${Cypress.spec.relative.replace('/.cy.*', '').replace('cypress/e2e/', '')}.mp4`});

    // Walk up the suite chain (outermost first) to collect inherited suite tags
    const suiteTags: string[] = [];
    let parent = taggedRunnable.parent as TaggedSuite | undefined;
    while (parent) {
        if (parent._tags?.length) {
            suiteTags.unshift(...parent._tags);
        }

        parent = parent.parent as TaggedSuite | undefined;
    }

    // Collect all unique tags (suite + test) and add to context
    const allTags = Array.from(new Set([...suiteTags, ...(taggedRunnable._tags ?? [])]));
    if (allTags.length > 0) {
        addContext({test}, {title: 'tags', value: allTags});
    }

    // Add screenshot context if test failed
    // if (test.state === 'failed') {
    //     addContext({test}, {title: 'screenshot', value: `screenshots/${Cypress.spec.relative.replace('cypress/e2e/', '')}/${runnable.parent.title} -- ${test.title} (failed).png`});
    // }
}

/** Public export */
export const context = {tag};
