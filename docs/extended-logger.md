# Cypress Logger Module

## Overview

The Logger module is a helper utility designed to enhance Cypress test logging capabilities by providing structured log levels and decorating log messages with appropriate severity indicators. It enables developers to create more organized and filterable test output by categorizing log messages into different levels.

This documentation also covers the testStep custom action, which provides structured test organization through foldable log groups.

## Features

- **Multiple Log Levels**: Support for DEBUG and INFO logging levels, can easily be extended if required.
- **Level-based Filtering**: Configure minimum log level to control output verbosity
- **JSON Object Logging**: Specialized method for logging JSON objects
- **Cypress Integration**: Seamless integration with Cypress logging system
- **Chainable Interface**: Returns Cypress chainable objects for fluent test writing
- **Environment Variable Control**: Persistent log level configuration across test runs
- **Test Step Organization**: Foldable test steps for better test structure and readability.

## Log Levels and Test Steps

The module supports two distinct logging levels with hierarchical filtering:

### Log.debug()
- **Purpose**: Detailed diagnostic information for debugging and development
- **Visibility**: Only shown when log level is set to DEBUG
- **Use Case**: Verbose logging for troubleshooting complex test scenarios

### Log.info()
- **Purpose**: General informational messages about test execution
- **Visibility**: Shown when log level is set to INFO or DEBUG
- **Use Case**: Standard test progress and status information

### cy.step()
- **Purpose**: Group related test actions under foldable and self-descriptive step names
- **Visibility**: Shown always
- **Use Case**: Organize complex test scenarios and have self-documenting code

## Configuration

### Setting Log Level

```typescript
import { Log } from '@jahia/cypress';

// Set visibility to DEBUG level for verbose output
Log.setLevel(Log.LEVEL.DEBUG);

// Set visibility to INFO level for standard output (default configuration)
Log.setLevel(Log.LEVEL.INFO);
```

## Usage

### Basic Logging

```typescript
import { Log } from '@jahia/cypress';

describe('Test Suite', () => {
  it('should demonstrate logging capabilities', () => {
    // Info level logging (always visible)
    Log.info('Starting test execution');
    
    // Debug level logging (only visible when DEBUG level is set)
    Log.debug('Detailed diagnostic information');
    
    // Chainable usage
    Log.info('Processing user data')
      .then(() => {
        // Continue with test logic
        cy.visit('/login');
      });
  });
});
```

### JSON Object Logging

```typescript
import { Log } from '@jahia/cypress';

describe('API Tests', () => {
  it('should log API responses', () => {
    cy.request('/api/users').then((response) => {
      // Log response data at DEBUG level
      Log.json(Log.LEVEL.DEBUG, response.body);
      
      // Log summary at INFO level
      const summary = { status: response.status, count: response.body.length };
      Log.json(Log.LEVEL.INFO, summary);
    });
  });
});
```

### Test Step Organization

The test step action creates foldable, hierarchical log groups to organize complex test scenarios:

```typescript
describe('User Registration Flow', () => {
  it('should register a new user successfully', () => {
    cy.step('Navigate to registration page', () => {
      cy.visit('/register');
      cy.url().should('include', '/register');
    });
    
    cy.step('Fill out registration form', () => {
      cy.get('[data-testid="first-name"]').type('John');
      cy.get('[data-testid="last-name"]').type('Doe');
      cy.get('[data-testid="email"]').type('john.doe@example.com');
      cy.get('[data-testid="password"]').type('SecurePassword123!');
      cy.get('[data-testid="confirm-password"]').type('SecurePassword123!');
    });
    
    cy.step('Submit registration and verify success', () => {
      cy.get('[data-testid="register-button"]').click();
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.url().should('include', '/welcome');
    });
  });
});
```

#### Test Step Features

- **Hierarchical Organization**: Group related test actions under descriptive step names
- **Foldable Interface**: Steps can be collapsed/expanded in Cypress Test Runner
- **Clean Log Output**: Reduces clutter by organizing actions into logical groups
- **Better Debugging**: Easier to identify which step failed during test execution
- **Documentation**: Steps serve as living documentation of test flow

## Output Format

### Console Display

The logger decorates messages with level indicators in the Cypress runner:

```
[ INFO ]  Starting test execution
[ DEBUG ] Detailed diagnostic information
[ INFO ]  {
  "status": 200,
  "data": {
    "users": 5
  }
}
```

### Level Filtering Behavior

| Set Level | INFO Messages | DEBUG Messages |
|-----------|---------------|----------------|
| INFO      | ✅ Visible    | ❌ Hidden      |
| DEBUG     | ✅ Visible    | ✅ Visible     |

## Best Practices

### Development Environment
- Use `DEBUG` level during active development for maximum visibility
- Log detailed state information and intermediate values
- Include context-rich debug messages for complex operations

```typescript
// Good: Detailed development logging
Log.debug('User authentication state: authenticated=true, role=admin');
Log.debug('Form validation results', validationResults);
```

### CI/CD Environment
- Use `INFO` level for cleaner output in automated environments
- Focus on test milestones and important status updates
- Avoid excessive logging that could impact performance

```typescript
// Good: Concise CI/CD logging
Log.info('Test suite: User Management - Started');
Log.info('Authentication tests completed successfully');
```

### Test Organization with Steps
- Use meaningful step descriptions that explain the intent
- Group related actions within logical steps
- Keep steps focused on a single responsibility
- Combine with logging for comprehensive test documentation

```typescript
// Good: Well-organized test with steps and logging
describe('E-commerce Checkout', () => {
  it('should complete purchase flow', () => {
    cy.step('Add products to cart', () => {
      Log.info('Starting product selection');
      cy.visit('/products');
      cy.get('[data-testid="product-1"]').click();
      cy.get('[data-testid="add-to-cart"]').click();
      Log.debug('Product added to cart successfully');
    });
    
    cy.step('Proceed to checkout', () => {
      Log.info('Initiating checkout process');
      cy.get('[data-testid="cart-icon"]').click();
      cy.get('[data-testid="checkout-button"]').click();
      Log.debug('Navigated to checkout page');
    });
    
    cy.step('Complete payment', () => {
      Log.info('Processing payment information');
      // Payment form interactions
      Log.info('Payment completed successfully');
    });
  });
});
```

## Integration Examples

### Page Object Pattern

```typescript
class LoginPage {
  visit() {
    Log.info('Navigating to login page');
    return cy.visit('/login');
  }
  
  login(username: string, password: string) {
    Log.debug(`Attempting login for user: ${username}`);
    cy.get('[data-testid="username"]').type(username);
    cy.get('[data-testid="password"]').type(password);
    cy.get('[data-testid="login-button"]').click();
    Log.info('Login form submitted');
  }
}
```

### Complex Workflows with Nested Steps

```typescript
describe('Multi-step Workflow', () => {
  it('should handle complex user journey', () => {
    cy.step('User Authentication', () => {
      cy.step('Navigate to login', () => {
        cy.visit('/login');
        Log.debug('Login page loaded');
      });
      
      cy.step('Enter credentials', () => {
        cy.get('[data-testid="username"]').type('testuser');
        cy.get('[data-testid="password"]').type('password');
        Log.debug('Credentials entered');
      });
      
      cy.step('Submit login form', () => {
        cy.get('[data-testid="login-button"]').click();
        Log.info('User logged in successfully');
      });
    });
    
    cy.step('Product Selection', () => {
      // Product selection steps
      Log.info('Product selection completed');
    });
    
    cy.step('Checkout Process', () => {
      // Checkout steps
      Log.info('Checkout process completed');
    });
  });
});
```

### Test Hooks

```typescript
describe('Feature Tests', () => {
  beforeEach(() => {
    cy.step('Test Environment Setup', () => {
      Log.debug('Setting up test environment');
      // Setup code
    });
  });
  
  afterEach(() => {
    cy.step('Test Environment Cleanup', () => {
      Log.debug('Cleaning up test environment');
      // Cleanup code
    });
  });
});
```

## Performance Considerations

### Log Level Impact

- **DEBUG Level**: Higher overhead due to increased log volume
- **INFO Level**: Minimal overhead with essential information only
- **JSON Logging**: Additional serialization overhead for large objects

### Optimization Tips

1. Use appropriate log levels for different environments
2. Avoid logging large objects in production environments
3. Consider conditional logging for performance-critical tests
4. Use test steps judiciously - too many nested steps can impact readability

## API Reference

### Logger Methods

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `info(message)` | `string` | `Cypress.Chainable` | Logs INFO level message |
| `debug(message)` | `string` | `Cypress.Chainable` | Logs DEBUG level message |
| `json(level, object)` | `LEVEL`, `string` | `Cypress.Chainable` | Logs formatted JSON object |
| `setVerbosity(level)` | `LEVEL` | `void` | Sets minimum visible log level |

### Test Step Methods

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `cy.step(message, func)` | `string`, `() => void` | `void` | Creates foldable test step group |

### Enums

| Enum | Values | Description |
|------|--------|-------------|
| `LEVEL` | `DEBUG (0)`, `INFO (1)` | Available logging levels |

### TypeScript Declarations

The testStep module extends the global Cypress interface:

```typescript
declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      step(message: string, func: () => void): void;
    }
  }
}
```

## Migration Guide

### From Console Logging

**Before:**
```typescript
console.log('Test started');
console.debug('Detailed information');
```

**After:**
```typescript
Log.info('Test started');
Log.debug('Detailed information');
```

### From Cypress.log()

**Before:**
```typescript
Cypress.log({ message: 'Custom message' });
```

**After:**
```typescript
Log.info('Custom message');
```

### From Unstructured Tests to Steps

**Before:**
```typescript
it('should complete user flow', () => {
  cy.visit('/login');
  cy.get('[data-testid="username"]').type('user');
  cy.get('[data-testid="password"]').type('pass');
  cy.get('[data-testid="login-button"]').click();
  cy.visit('/products');
  cy.get('[data-testid="product-1"]').click();
  cy.get('[data-testid="add-to-cart"]').click();
});
```

**After:**
```typescript
it('should complete user flow', () => {
  cy.step('Login to application', () => {
    cy.visit('/login');
    cy.get('[data-testid="username"]').type('user');
    cy.get('[data-testid="password"]').type('pass');
    cy.get('[data-testid="login-button"]').click();
  });
  
  cy.step('Add product to cart', () => {
    cy.visit('/products');
    cy.get('[data-testid="product-1"]').click();
    cy.get('[data-testid="add-to-cart"]').click();
  });
});
```
