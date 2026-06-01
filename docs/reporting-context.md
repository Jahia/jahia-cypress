# Reporting Context

## Overview

Test tags are user-defined labels that can be attached to test suites and individual tests to provide metadata about test characteristics, scope, and purpose. Tags are collected during test execution and included in the mochawesome test report.

## Integration with TestRail and jahia-reporter

Tags defined in Cypress tests are **automatically synchronized to TestRail test cases** by the `jahia-reporter` tool during the test reporting phase. This enables:

- **Test categorization** in TestRail for better organization
- **Dashboard filtering** based on test characteristics
- **Reporting dashboards** that slice data by tag combinations (e.g., smoke tests, regression, performance, critical path)
- **Traceability** linking test runs to business requirements or feature areas

## Usage

### Basic Syntax

Use the `tag()` function to attach one or more tags:

```typescript
import {context} from '@jahia/cypress';

describe('Authentication', () => {
    context.tag('smoke', 'critical');

  it('should login successfully', () => {
      context.tag('p1');  // Add P1 severity
      cy.login();
      cy.url().should('include', '/home');
  });

  it('should logout successfully', () => {
    cy.logout();
  });
});
```

### Where to Call

- **In `describe()`**: Tags apply to **all nested tests** in the suite (inherited by child suites and tests)
- **In `it()`**: Tags apply to **only that specific test**
- **Both**: Combine suite-level and test-level tags (both are collected)

### Example: Multi-Level Tagging

```typescript
import {context} from '@jahia/cypress';

describe('Content Management', () => {
  context.tag('regression', 'content');  // Suite-level tags

  describe('Publishing Workflow', () => {
    context.tag('critical');  // Additional suite-level tag

    it('should publish page', () => {
      context.tag('p0', 'smoke');  // Test-level tags
      // effective tags: ['regression', 'content', 'critical', 'p0', 'smoke']
    });

    it('should unpublish page', () => {
      // effective tags: ['regression', 'content', 'critical']
    });
  });
});
```

## Collection & Storage

- Tags are collected during test execution via Mocha hooks
- Suite tags are inherited by nested describe blocks and tests
- All unique tags are deduplicated
- Tags are added to the mochawesome test report under the `context` field
- The report is used by jahia-reporter to sync with TestRail

## Best Practices

1. **Use consistent tag names** across your test suite
2. **Keep tag values simple** (lowercase, no spaces, use hyphens for multi-word tags)
3. **Avoid overtagging** — use a reasonable number of tags (3-5 per test)
4. **Combine categories** — mix priority, type, and feature tags for flexibility
5. **Use suite-level tags** for common characteristics (saves repetition)
6. **Add test-level tags** for exceptions or special cases

## Troubleshooting

### Tags not appearing in TestRail
- Ensure `context.tag()` is called at the right scope (in `describe()` or `it()`)
- Check that jahia-reporter is configured to sync tags to TestRail
- Verify the test report is being generated and contains `context` attribute with tags

