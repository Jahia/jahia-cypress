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

### 1. Fail After Each Test (default)
- **Strategy**: `STRATEGY.failAfterEach`
- **Behavior**: Collects errors/warnings during test execution and fails at the end of the one; the rest of tests will be skipped
- **Use Case**: Suitable when you want the test to complete but still get immediate feedback
- **Pros**: Allows test to be executed till the end before providing a report
- **Cons**: Since the analysis happens in afterEach() hook, the rest of spec will be ignored

### 2. Fail After All Tests
- **Strategy**: `STRATEGY.failAfterAll`
- **Behavior**: Collects all errors/warnings and reports them after the entire test suite completes; the last test will be marked as failed
- **Use Case**: Ideal for CI/CD environments where you want a complete test run overview
- **Pros**: Complete test suite execution with comprehensive error reporting
- **Cons**: Error reporting may be confusing as the last test will be marked as failed, since the errors analysis and reporting is done in after() hook

## Usage

### Basic Setup

#### Enable the Logger for the repo
This call should only be used in `tests/cypress/support/e2e.js`. Add the following code in the repo where functionality should be used:

```typescript
import {jsErrorsLogger} from '@jahia/cypress';

// Enable and attach JS Errors Logger
jsErrorsLogger.enable();
```

### Disabling the Logger

#### Via Environment Variable

```bash
# Disable in CI/CD or specific environments
export JAHIA_HOOKS_DISABLE_JS_LOGGER="true"
```

#### Disable for the specific Spec

```typescript
import {jsErrorsLogger} from '@jahia/cypress';

describe('Tests with disabled JS logger', () => {
  before(() => {
      jsErrorsLogger.disable();
  });
  
  it('should run without JS error monitoring', () => {
    // Test implementation
  });
});
```

## Configuration

### Environment Variables

| Variable                        | Type | Description |
|---------------------------------|------|-------------|
| `JAHIA_HOOKS_DISABLE_JS_LOGGER` | boolean | Disables the logger when set to `true` |

### Programmatic Configuration

It is **strongly** recommended to add custom configuration in project's common files, e.g. `tests/cypress/support/e2e.js` to have it applied to all test-cases within the project.

```typescript
import {jsErrorsLogger} from '@jahia/cypress';

// Enable and attach JS Errors Logger
jsErrorsLogger.enable();

// Set preferrable error handling strategy
jsErrorsLogger.setStrategy(jsErrorsLogger.STRATEGY.failAfterAll);

// Define allowed warnings that won't trigger failures
jsErrorsLogger.setAllowedJsWarnings([
  'Warning: React Hook',
  'Warning: componentWillReceiveProps'
]);
```

## Error Reporting Format

### Single Test Error (failAfterEach)

```
CONSOLE ERRORS and WARNINGS FOUND:

❌️ TEST: Should be authenticated when correct credentials and code are provided: ❌️
--------------------------------------------------
URL: http://localhost:8080/jahia/dashboard
ISSUES:
- ⚠️ Unsatisfied version 5.0.1 from @jahia/jcontent of shared singleton module redux (required ^4.0.5)
- ⚠️ Unsatisfied version 9.2.0 from @jahia/jcontent of shared singleton module react-redux (required ^8.0.5)
- ❌️ TypeError: Cannot read property 'user' of undefined
```

### Multiple Test Errors (failAfterAll)

```
CONSOLE ERRORS and WARNINGS FOUND:

❌️ TEST: Should be authenticated when correct credentials and code are provided: ❌️
--------------------------------------------------
URL: http://localhost:8080/jahia/dashboard
ISSUES:
- ⚠️ No satisfying version (^1.11.9) of shared module dayjs found in shared scope default.
- ⚠️ No satisfying version (^3.0.6) of shared module @jahia/react-material found in shared scope default.
- ❌️ TypeError: Cannot read property 'user' of undefined
==================================================

❌️ TEST: Should be authenticated on a specific site when correct credentials and code are provided: ❌️
--------------------------------------------------
URL: http://localhost:8080/jahia/admin
ISSUES:
- ⚠️ No satisfying version (^3.0.6) of shared module @jahia/react-material found in shared scope default.
==================================================
```

## Best Practices

### Development Environment
- Use `STRATEGY.failAfterEach` for immediate feedback during development
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

| Method | Parameters | Return Type | Description                                            |
|--------|------------|-------------|--------------------------------------------------------|
| `setStrategy(strategy)` | STRATEGY enum | void | Sets the error handling strategy |
| `setAllowedJsWarnings(warnings)` | string[] | void | Configures allowed warning messages  |
| `disable()` | - | void | Disables the logger for the current spec |
| `enable()` | - | void | Enables the logger for the current repo |

### Enums

| Enum | Values | Description |
|------|--------|-------------|
| `STRATEGY` | `failAfterAll`, `failAfterEach` | Error handling strategies |
