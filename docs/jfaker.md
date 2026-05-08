# jFaker - Fake Data Generation Module

## Overview

The `jfaker` module is a flexible fake data generation utility for Cypress testing that combines the power of [Faker.js](https://fakerjs.dev/) with security-focused injection payload generation. It provides a unified API to generate both realistic test data and security testing payloads (XSS, SQL injection, etc.) through a dynamic proxy-based interface.

## Key Features

- **Faker.js Integration**: Full access to all `Faker.js` methods for generating realistic test data
- **Security Injection Payloads**: Built-in support for common injection attack vectors (XSS, SQL, Bash, etc.)
- **Global Type Management**: Set a global data type that automatically overrides faker calls with injection data
- **Flexible Configuration**: Control generation behavior with options like length, provider, and overridability
- **Dynamic API**: Chain method calls naturally (e.g., `jfaker.person.firstName()`)
- **String Escaping**: Built-in utility to escape special characters for safe usage

## Installation

The module is automatically available when using the jahia-cypress package:

```typescript
import {jfaker} from '@jahia/cypress';
```

## API Reference

### Data Generation Methods

#### Faker.js Methods

All `Faker.js` methods are available through the dynamic proxy. See [Faker.js API documentation](https://fakerjs.dev/api/) for the complete list.

**Basic Usage:**
```typescript
jfaker.person.firstName()          // Returns: "John"
jfaker.person.lastName()           // Returns: "Doe"
jfaker.internet.email()            // Returns: "john.doe@example.com"
jfaker.location.city()             // Returns: "New York"
jfaker.company.name()              // Returns: "Acme Corporation"
jfaker.lorem.sentence()            // Returns: "Lorem ipsum dolor sit amet."
```

**With Options:**
```typescript
jfaker.internet.email({provider: 'example.com'})  // Returns: "user@example.com"
jfaker.string.alpha({length: 10})                 // Returns: 10-character string
jfaker.number.int({min: 1, max: 100})            // Returns: random number 1-100
jfaker.lorem.word({length: {min: 5, max: 10}})   // Returns: word with 5-10 chars
```

#### Injection Payload Methods

Generate security testing payloads for various attack vectors:

- **`.xss()`** - Cross-Site Scripting (XSS) payloads
- **`.sql()`** - SQL injection payloads
- **`.bash()`** - Bash/shell command injection payloads
- **`.chars()`** - Random special characters
- **`.htmlentities()`** - HTML entities
- **`.numbers()`** - Number-based edge cases and payloads

**Basic Usage:**
```typescript
// Default behavior (no length specified): 2-5 random items joined
jfaker.xss()          // Returns: random XSS payload
jfaker.sql()          // Returns: random SQL injection payload
jfaker.bash()         // Returns: random Bash injection payload
```

**With Length Control:**
```typescript
// Generate specific length (characters will be randomly selected and joined)
jfaker.xss({length: 100})         // Returns: XSS payload exactly 100 chars long
jfaker.sql({length: 50})          // Returns: SQL payload exactly 50 chars long

// Use all available payloads for the type
jfaker.xss({length: -1})          // Returns: all XSS payloads joined together
jfaker.sql({length: -1})          // Returns: all SQL payloads joined together
```

### Utility Methods

#### `setDataType(type: string): void`

Sets the global data type for all subsequent jfaker calls. When set to an injection type, all faker method calls will return injection data instead.

**Parameters:**
- `type`: One of `'faker'`, `'xss'`, `'sql'`, `'bash'`, `'chars'`, `'htmlentities'`, or `'numbers'`

**Usage:**
```typescript
// Set to generate XSS payloads by default
jfaker.setDataType('xss');

// Now all calls return XSS data (unless safe: true is used)
jfaker.person.firstName();        // Returns: XSS payload, not a real name
jfaker.internet.email();          // Returns: XSS payload, not a real email

// Reset to normal faker behavior
jfaker.setDataType('faker');
jfaker.person.firstName();        // Returns: "John" (normal faker data)
```

**CI/CD Integration:**

The data type can also be set via the `JAHIA_CYPRESS_INJECTION_TYPE` environment variable from your CI/CD pipeline:

```bash
# Run tests with XSS injection data
JAHIA_CYPRESS_INJECTION_TYPE=xss

# Run tests with SQL injection data
JAHIA_CYPRESS_INJECTION_TYPE=sql
```

#### `getDataType(): string`

Retrieves the current global data type.

**Returns:** The current data type (defaults to `'faker'` if not set)

**Usage:**
```typescript
jfaker.setDataType('xss');
console.log(jfaker.getDataType());  // Outputs: "xss"
```

#### `escape(str: string): string`

Escapes special characters in a string to prevent issues when used in HTML or JavaScript contexts. E.g.: say, page properly handles xss injections and displays them escaped. In this case, it makes sense to validate these using `escape()` funtion.

**Parameters:**
- `str`: String to escape

**Returns:** Escaped string

**Usage:**
```typescript
jfaker.escape('Hello "World"');     // Returns: 'Hello \"World\"'
jfaker.escape('Line1\nLine2');      // Returns: 'Line1\\nLine2'
jfaker.escape('Tab\there');         // Returns: 'Tab\\there'
```

## Advanced Usage

### Safe Option

When a global injection type is overridden, you can force specific calls to keep using `Faker.js` data by setting `safe: true`.

```typescript
// Set global type to XSS
jfaker.setDataType('xss');

// This returns XSS payload
jfaker.person.firstName();

// This forces Faker.js data generation (overrides global setting)
// Call down below always returns human-readable first name, e.g.: "John"
jfaker.person.firstName({safe: true});

// Combining with other options
// Call down below always returns human-readable email,
// e.g. "user@example.com" (faker data with provider option)
jfaker.internet.email({
    provider: 'example.com',
    safe: true
});
```

### Options Summary

| Option             | Type | Injection Methods | Faker Methods | Description                                                                                        |
|--------------------|------|-------------------|---------------|----------------------------------------------------------------------------------------------------|
| `length`           | `number` | ✅ | ✅* | For injections: exact character length (-1 = all payloads). For faker: passed to the faker method. |
| `safe`             | `boolean` | ❌ | ✅ | When `true`, forces to use `Faker.js` data even when global type is overridden (set to injection). |
| *any faker option* | various | ❌ | ✅ | Any option supported by the specific Faker.js method (e.g., `provider`, `min`, `max`).             |

\* Many Faker.js methods accept a `length` option, such as `jfaker.string.alpha({length: 10})`.

## Usage Examples

### Example 1: Form Testing with Realistic Data

```typescript
describe('User Registration Form', () => {
    it('should register a new user', () => {
        cy.visit('/register');
        
        cy.get('#firstName').type(jfaker.person.firstName());
        cy.get('#lastName').type(jfaker.person.lastName());
        cy.get('#email').type(jfaker.internet.email({provider: 'testdomain.com'}));
        cy.get('#phone').type(jfaker.phone.number());
        cy.get('#company').type(jfaker.company.name());
        cy.get('#city').type(jfaker.location.city());
        
        cy.get('#submit').click();
        cy.contains('Registration successful').should('be.visible');
    });
});
```

### Example 2: Security Testing with Injection Payloads

```typescript
describe('Input Validation - XSS Protection', () => {
    it('should sanitize XSS payloads in username field', () => {
        cy.visit('/profile');
        
        const xssPayload = jfaker.xss({length: 50});
        
        cy.get('#username').type(xssPayload, {
            parseSpecialCharSequences: false  // Important!
        });
        
        cy.get('#save').click();
        
        // Verify the payload is escaped/sanitized
        cy.get('#username-display').invoke('text').then(text => {
            expect(text).not.to.include('<script>');
        });
    });
});
```

### Example 3: Global Injection Testing

```typescript
describe('Security Test Suite - SQL Injection', () => {
    before(() => {
        // Set global type to SQL injection for the entire suite
        jfaker.setDataType('sql');
    });
    
    after(() => {
        // Reset to faker after tests
        jfaker.setDataType('faker');
    });
    
    it('should protect search from SQL injection', () => {
        cy.visit('/search');
        
        // This returns SQL injection payload due to global setting
        const searchTerm = jfaker.lorem.word();
        
        cy.get('#search').type(searchTerm, {parseSpecialCharSequences: false});
        cy.get('#search-btn').click();
        cy.contains('No results found').should('be.visible');
    });
    
    it('should use faker data when explicitly needed', () => {
        cy.visit('/search');
        
        // Force to use Faker.js data for this specific call
        const normalSearch = jfaker.lorem.word({safe: true});
        
        cy.get('#search').type(normalSearch);
        cy.get('#search-btn').click();
        // Test with normal search term...
    });
});
```

### Example 4: Comprehensive Input Fuzzing

```typescript
describe('Input Field Robustness', () => {
    const injectionTypes = ['xss', 'sql', 'bash', 'chars', 'htmlentities', 'numbers'];
    
    injectionTypes.forEach(type => {
        it(`should handle ${type} injection payloads`, () => {
            cy.visit('/form');
            
            const payload = jfaker[type]();
            
            cy.get('#input-field').type(payload, {
                parseSpecialCharSequences: false
            });
            
            cy.get('#submit').click();
            
            // Verify no errors or security issues
            cy.get('.error-message').should('not.exist');
        });
    });
});
```

### Example 5: Dynamic Test Data Creation

```typescript
describe('User Creation', () => {
    it('should create multiple users with unique data', () => {
        for (let i = 0; i < 5; i++) {
            const user = {
                firstName: jfaker.person.firstName(),
                lastName: jfaker.person.lastName(),
                email: jfaker.internet.email(),
                username: jfaker.internet.userName(),
                password: jfaker.internet.password({length: 12}),
                bio: jfaker.lorem.paragraph(),
                age: jfaker.number.int({min: 18, max: 80})
            };
            
            cy.request('POST', '/api/users', user).then(response => {
                expect(response.status).to.eq(201);
            });
        }
    });
});
```

## Important Notes

### Cypress `.type()` Command

When using injection payloads with Cypress's `.type()` command, **always** use `parseSpecialCharSequences: false` to prevent Cypress from interpreting special characters as commands:

```typescript
// ❌ WRONG - Cypress will interpret {, }, [, ] as special commands
cy.get('#input').type(jfaker.xss());

// ✅ CORRECT - Cypress treats the string literally
cy.get('#input').type(jfaker.xss(), {parseSpecialCharSequences: false});
```

### Data Persistence

The global data type is stored in Cypress environment variables (`JAHIA_CYPRESS_INJECTION_TYPE`), which means:
- It persists across specs within a test run
- It can be set from CI/CD pipelines as an environment variable
- It's cleared when Cypress restarts

## Best Practices

1. **Reset Global Type**: Always reset the global data type after your test suite if you've changed it and other suites are expected to run afterwards:
   ```typescript
   after(() => {
       jfaker.setDataType('faker');
   });
   ```

2. **Use Descriptive Variables**: Store generated data in descriptive variables for better test readability:
   ```typescript
   const userEmail = jfaker.internet.email({provider: 'test.com'});
   const xssPayload = jfaker.xss({length: 100});
   ```

3. **Security Testing using existing tests codebase**: Use `jfaker` within your tests instead of hardcoded strings or direct `Faker.js` calls. In this case, the same codebase can be used for e2e as well as for injections testing by means of passing specific injections type from CI/CD or runtime (when injections type is not explicitly set, `Faker.js` is used by default). Use `safe: true` for values which should always return `Faker.js` entities.

4. **CI/CD Integration**: Use environment variables to run the same test suite with different data types:
   ```bash   
   # Security tests with XSS
   JAHIA_CYPRESS_INJECTION_TYPE=xss npm run cypress:run
   
   # Security tests with SQL injection
   JAHIA_CYPRESS_INJECTION_TYPE=sql npm run cypress:run
   ```

## Technical Details

### Architecture

The module uses a `DeepApi` class that implements a Proxy-based architecture:
- **Property access** creates a deeper proxy, building a path (e.g., `person.firstName`)
- **Function calls** execute the handler with the accumulated path and arguments
- This enables the dynamic, chainable API without pre-defining all possible methods

### Injection Data Sources

Injection payloads are imported from TypeScript files in the `src/injections/` directory:
- `xss-data.ts` - XSS attack vectors
- `sql-data.ts` - SQL injection patterns
- `bash-data.ts` - Shell command injections
- `chars-data.ts` - Special characters
- `htmlentities-data.ts` - HTML entity variations
- `numbers-data.ts` - Numeric edge cases

### Length Handling for Injections

- **Undefined length**: Picks 2-5 random items from the payload array and joins them
- **Positive length**: Concatenates random items until reaching the specified character count, then trims to exact length
- **Length = -1**: Returns all available payloads for that type joined together

## See Also

- [Faker.js API Documentation](https://fakerjs.dev/api/) - Complete reference for all faker methods
- [OWASP Injection Attacks](https://owasp.org/www-community/Injection_Flaws) - Understanding injection vulnerabilities
- [Cypress Type Command](https://docs.cypress.io/api/commands/type) - Details on the `type()` command options

## Support

For issues, questions, or contributions related to the jfaker module, please refer to the main jahia-cypress repository.
