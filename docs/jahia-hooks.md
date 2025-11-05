# Jahia Hooks

A unified module that combines Headers Interceptor and JS Errors Logger functionality for Cypress tests. This module provides a centralized way to monitor and report various types of issues in Cypress tests.

## Features

- **Headers Interceptor**: Validates HTTP response headers against specified patterns
- **JS Errors Logger**: Monitors JavaScript console errors and warnings
- **Unified Error Reporting**: Collects and reports all issues in a structured format
- **Flexible Strategies**: Choose when to report issues (immediately, after each test, or after all tests)
- **Configurable**: Enable/disable individual components and customize behavior

## Installation

Import the module in your Cypress support files:

```typescript
import { jahiaHooks } from './support/jahiaHooks';
```

## Usage

### Basic Setup

```typescript
// Attach all hooks with default settings
jahiaHooks.attachHooks();
```

### Configuration

#### Set Strategy

Choose when to report issues:

```typescript
// Fail immediately when issues are detected
jahiaHooks.setStrategy(jahiaHooks.STRATEGY.failFast);

// Fail after each test if issues are found
jahiaHooks.setStrategy(jahiaHooks.STRATEGY.failAfterEach);

// Collect all issues and fail after all tests
jahiaHooks.setStrategy(jahiaHooks.STRATEGY.failAfterAll);
```

#### Configure Headers Interceptor

```typescript
// Set header validation patterns
jahiaHooks.setHeadersInterceptorFormat({
    'content-type': /^application\/json/,
    'x-custom-header': /^custom-value-\d+$/
});
```

#### Configure JS Errors Logger

```typescript
// Set allowed warnings (these will be ignored)
jahiaHooks.setAllowedWarnings([
    'Warning: componentWillMount is deprecated',
    'ResizeObserver loop limit exceeded'
]);
```

### Environment Variables

Control behavior using Cypress environment variables:

```typescript
// Disable all hooks
Cypress.env('JAHIA_HOOKS_DISABLED', true);

// Disable only headers interceptor
Cypress.env('HEADERS_INTERCEPTOR_DISABLED', true);

// Disable only JS errors logger
Cypress.env('JS_LOGGER_DISABLED', true);
```

## Strategies

### failFast
- Reports issues immediately when detected
- Stops test execution on first issue
- Best for development and debugging

### failAfterEach
- Collects issues during test execution
- Reports issues after each test completes
- Good balance between immediate feedback and test completion

### failAfterAll
- Collects all issues from all tests
- Reports comprehensive summary after all tests complete
- Best for CI/CD pipelines where you want to see all issues

## Issue Types

The module categorizes issues into three types:

- `HEADERS`: HTTP response header validation failures
- `JS_ERRORS`: JavaScript console errors
- `JS_WARNINGS`: JavaScript console warnings (filtered by allowed warnings)

## Error Reporting Format

When issues are found, they are reported in a structured format:

```
[JAHIA HOOKS] ISSUES FOUND:

=== HEADERS ===
TEST: Sample Test Name
ISSUES:
- content-type: text/html
- x-custom-header: invalid-value

=== JS_ERRORS ===
TEST: Another Test Name
ISSUES:
- ReferenceError: undefined variable
- TypeError: Cannot read property 'foo' of undefined

=== JS_WARNINGS ===
TEST: Warning Test
ISSUES:
- Warning: Deprecated API usage
```

## API Reference

### Methods

#### `attachHooks()`
Attaches all enabled hooks based on current configuration.

#### `setStrategy(strategy: STRATEGY)`
Sets the reporting strategy.

#### `setHeadersInterceptorFormat(headers: { [key: string]: RegExp })`
Sets validation patterns for HTTP response headers.

#### `setAllowedWarnings(warnings: string[])`
Sets list of allowed warning messages that will be ignored.

### Constants

#### `STRATEGY`
- `failFast`: Immediate failure on first issue
- `failAfterEach`: Failure after each test
- `failAfterAll`: Failure after all tests

#### `ISSUE_TYPE`
- `HEADERS`: Header validation issues
- `JS_ERRORS`: JavaScript errors
- `JS_WARNINGS`: JavaScript warnings

## Migration from Separate Modules

If you were using the separate `hooks.ts` and `jsErrorsLogger.ts` modules:

### From hooks.ts
```typescript
// Old way
import { jahiaHooks } from './hooks';
jahiaHooks.attachHeadersInterceptor();
jahiaHooks.setHeadersInterceptorFormat({...});

// New way
import { jahiaHooks } from './jahiaHooks';
jahiaHooks.attachHooks(); // Attaches headers interceptor if enabled
jahiaHooks.setHeadersInterceptorFormat({...});
```

### From jsErrorsLogger.ts
```typescript
// Old way
import { jsErrorsLogger } from './jsErrorsLogger';
jsErrorsLogger.attachHooks();
jsErrorsLogger.setStrategy(jsErrorsLogger.STRATEGY.failFast);

// New way
import { jahiaHooks } from './jahiaHooks';
jahiaHooks.attachHooks(); // Attaches JS logger if enabled
jahiaHooks.setStrategy(jahiaHooks.STRATEGY.failFast);
```

## Best Practices

1. **Use failFast during development** for immediate feedback
2. **Use failAfterAll in CI/CD** to get complete test reports
3. **Configure allowed warnings** to reduce noise from known issues
4. **Set appropriate header validation patterns** for your API endpoints
5. **Use environment variables** to control behavior per environment

## Troubleshooting

### No Issues Reported
- Check if hooks are disabled via environment variables
- Verify that `attachHooks()` is called in your support files
- Ensure proper strategy is set for your use case

### Too Many Warnings
- Use `setAllowedWarnings()` to filter out known acceptable warnings
- Consider using more specific warning patterns

### Headers Not Validated
- Verify `setHeadersInterceptorFormat()` is called with proper RegExp patterns
- Check that the header names match exactly (case-sensitive)
- Ensure the interceptor is not disabled
