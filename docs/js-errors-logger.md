# JavaScript Errors Logger

## Overview

The JavaScript Errors Logger is a comprehensive monitoring and reporting module for JavaScript errors and warnings in Cypress tests. It provides automated detection, collection, and reporting of console errors and warnings that occur during test execution, helping maintain code quality and identify issues early in the development process.

## Features

- **Multiple Strategy Support**: Choose from three different error handling strategies
- **Configurable Warning Filtering**: Define allowed warnings that won't trigger test failures
- **Automatic Hook Integration**: Seamlessly integrates with Cypress test lifecycle
- **Detailed Error Reporting**: Comprehensive error messages with test context

## Error Handling Strategies

The logger supports three distinct strategies for handling JavaScript errors and warnings:

### 1. Fail Fast (Default)
- **Strategy**: `STRATEGY.failFast`
- **Behavior**: Fails immediately when an error or warning is detected
- **Use Case**: Best for development environments where immediate feedback is crucial
- **Pros**: Quick identification of issues
- **Cons**: May stop test execution on first error, preventing discovery of additional issues

### 2. Fail After Each Test
- **Strategy**: `STRATEGY.failAfterEach`
- **Behavior**: Collects errors/warnings during test execution and fails at the end of each test
- **Use Case**: Suitable when you want each test to complete but still get immediate feedback
- **Pros**: Allows full test execution while providing per-test feedback
- **Cons**: If errors occur in hooks (beforeEach/afterEach), remaining spec tests will be skipped

### 3. Fail After All Tests
- **Strategy**: `STRATEGY.failAfterAll`
- **Behavior**: Collects all errors/warnings and reports them after the entire test suite completes
- **Use Case**: Ideal for CI/CD environments where you want a complete test run overview
- **Pros**: Complete test suite execution with comprehensive error reporting
- **Cons**: Error reporting may be confusing as the last test will be marked as failed, since the errors analysis and reporting is done in after() hook

## Configuration

### Environment Variables

| Variable | Type | Description |
|----------|------|-------------|
| `JS_LOGGER_DISABLED` | boolean | Disables the logger when set to `true` |

### Programmatic Configuration

It is **strongly** recommended to add custom configuration in project's common files, e.g. `tests/cypress/support/e2e.js` to have it applied to all test-cases within the project.

```typescript
import { jsErrorsLogger } from '@jahia/cypress';

// Set preferrable error handling strategy
jsErrorsLogger.setStrategy(jsErrorsLogger.STRATEGY.failAfterEach);

// Define allowed warnings that won't trigger failures
jsErrorsLogger.setAllowedJsWarnings([
  'Warning: React Hook',
  'Warning: componentWillReceiveProps'
]);
```

## Usage

### Basic Setup

The logger is automatically initialized when jahia-cypress is imported and registered in the Cypress support files. No manual setup is required for basic functionality.

### Disabling the Logger

#### Via Environment Variable

```bash
# Disable in CI/CD or specific environments
export JS_LOGGER_DISABLED=true
```

#### Temporarily in Tests

```typescript
describe('Tests with disabled JS logger', () => {
  before(() => {
    Cypress.env('JS_LOGGER_DISABLED', true);
  });
  
  after(() => {
    Cypress.env('JS_LOGGER_DISABLED', false);
  });
  
  it('should run without JS error monitoring', () => {
    // Test implementation
  });
});
```

## Error Reporting Format

### Single Test Error (failFast/failAfterEach)

```
Error: CONSOLE ERRORS and WARNINGS FOUND:
- TypeError: Cannot read property 'foo' of undefined
- Warning: React Hook useEffect has missing dependency
```

### Multiple Test Errors (failAfterAll)

```
Error: CONSOLE ERRORS and WARNINGS FOUND:

TEST: should load homepage
ISSUES:
- TypeError: Cannot read property 'user' of undefined
- Warning: componentWillMount is deprecated

TEST: should handle form submission
ISSUES:
- ReferenceError: handleSubmit is not defined
```

## Best Practices

### Development Environment
- Use `STRATEGY.failFast` for immediate feedback during development
- Configure comprehensive allowed warnings list for known, acceptable warnings
- Enable detailed logging for debugging purposes

### CI/CD Environment
- Use `STRATEGY.failAfterAll` to get complete test coverage
- Keep allowed warnings list minimal to catch regressions
- Consider disabling in performance testing environments

### Team Collaboration
- Maintain a shared allowed warnings configuration
- Document any permanently allowed warnings with justification
- Regular review and cleanup of allowed warnings list

## API Reference

### Methods

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `setStrategy(strategy)` | STRATEGY enum | void | Sets the error handling strategy |
| `setAllowedJsWarnings(warnings)` | string[] | void | Configures allowed warning messages |

### Enums

| Enum | Values | Description |
|------|--------|-------------|
| `STRATEGY` | `failFast`, `failAfterAll`, `failAfterEach` | Error handling strategies |
