# FakeData Module

## Overview

The `FakeData` module provides utilities for generating test data in Cypress tests. It supports two primary modes:

1. **Faker.js Integration** - Generate realistic fake data using [@faker-js/faker](https://www.npmjs.com/package/@faker-js/faker)
2. **Injection Payloads** - Load and use security testing payloads (XSS, SQL injection, etc.) from fixture files

## Features

- Generates random human-readable test data using Faker.js
- Built-in security injection payloads (XSS, SQL, Bash, etc.)
- Configurable via runtime API or CI/CD environment variables
- Lazy loading and caching for optimal performance
- Eliminates separate adding of faker-js to your project (library will be automatically included into this package and exported afterwards for future usage)

## Basic Usage

### 1. Enable the Module

Import module and call `FakeData.enable()` in your `e2e.js` file:

```typescript
// cypress/e2e.js
import {FakeData} from '@jahia/cypress';

FakeData.enable();
```

This loads injection payloads from fixture files into memory before tests run.

### 2. Generate Test Data

#### Using Faker.js

```typescript
it('should create a user', () => {
    // Generate data with entity (shorthand)
    const name = FakeData.get('person.firstName');
    // Generate data with entity and Faker.js options
    const email = FakeData.get({entity: 'internet.email', fakerOptions: { provider: 'example.com'}});
    // Generate data with entity (object notation).
    // Entity will always be generated using faker, since explicitly passed type overrides global settings.
    const phone = FakeData.get({entity: 'phone.number', type: 'faker'});
    
    cy.get('#firstName').type(firstName);
    cy.get('#email').type(email);
    cy.get('#phone').type(phone);
});
```

#### Requesting Injection Payloads Explicitly

```typescript
it('should handle XSS attacks', () => {
    // Random 3-6 XSS payloads joined as string
    const xssPayload = FakeData.get({type: 'xss'});
    
    cy.get('input').type(xssPayload);
});

it('should handle SQL injection', () => {
    // Specific length of SQL payloads
    const sqlPayload = FakeData.get({type: 'sql', length: 100});
    
    cy.get('#search').type(sqlPayload);
});

it('should test with all XSS vectors', () => {
    // Get all available XSS payloads
    const allXSS = FakeData.get({type: 'xss', length: -1});
    
    cy.log(`Testing ${allXSS.length} XSS vectors`);
});
```

## API Reference

### `FakeData.enable()`

Loads injection payload data from fixture files. Must be called in cypress/e2e.js to initialize the module and prepare it for further usage.

**Usage:**
```typescript
FakeData.enable();
```

**When to call:**
- In your `cypress/e2e.js` file (recommended)
- In a `before()` hook at the top of your test spec (allowed if there is strong necessity)

---

### `FakeData.get(options: OptionsObject | string)`

Generates test data based on provided options. 
Options can be passed as an `OptionsObject` (see description down below) or as a shorthand `Faker.js` entity (e.g. `person.firstName`).

**OptionsObject:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `type` | `string` | No | `'faker'` or env var | Injection type: `'xss'`, `'sql'`, `'bash'`, `'chars'`, `'htmlentities'`, `'numbers'`, or `'faker'` |
| `entity` | `string` | No | `'lorem.sentence'` | Faker.js method in dot notation (e.g., `'person.firstName'`). See [Faker.js API documentation](https://fakerjs.dev/api/) |
| `length` | `number` | No | random 3-6 | Length of result string. `-1` returns all payloads, `> 0` returns string up to specified length, `undefined` returns random 3-6 items.</br>**NOTE:** ignored when `type === 'faker'` |
| `fakerOptions` | `Record<string, unknown> \| Array<unknown> \| string \| number \| boolean` | No | `undefined` | Options object to pass to the Faker.js method.</br>**NOTE:** ignored when `type !== 'faker'` |

**Returns:** `string` - Generated test data

**Examples:**
```typescript
// Faker.js - simple (shorthand)
FakeData.get('person.lastName');

// Explicitly enforced Faker.js (will always be using Faker.js, despite of other global settings)
FakeData.get({entity: 'person.lastName', type: 'faker'});

// Faker.js data - with options
FakeData.get({ 
    entity: 'internet.email', 
    fakerOptions: { provider: 'test.com' } 
});

// Explicitly specified Injection - random length
FakeData.get({type: 'xss'});

// Explicitly specified Injection - specific length
FakeData.get({type: 'sql', length: 500});

//Explicitly specified Injection - all payloads
FakeData.get({type: 'bash', length: -1});
```

---

### `FakeData.setFakeDataType(type)`

Sets the default injection type to use when `type` is not specified in `get()` calls.

**Parameters:**
- `type` (`string`): One of `'faker'`, `'xss'`, `'sql'`, `'bash'`, `'chars'`, `'htmlentities'`, `'numbers'`

**Usage:**
```typescript
// Set default type to XSS, e.g. in cypress/e2e.js (recommended) or before() hook
FakeData.setInjectionsType('xss');

// Now all get() calls without type will use XSS
const payload1 = FakeData.get('person.firstName'); // Uses XSS
const payload2 = FakeData.get({length: 100}); // Uses XSS with length 100
```

---

### `FakeData.getFakeDataType()`

Returns the current default injection type.

**Returns:** `string` - Current injection type (defaults to `'faker'`)

**Usage:**
```typescript
const currentType = FakeData.getInjectionsType();
cy.log(`Using injection type: ${currentType}`);
```

---

## Configuration

### Configuration Priority

The `FakeData.get()` method determines which data source to use based on the following priority:

1. **Explicit `type` parameter** - If provided in options, it takes highest priority
2. **Runtime configuration** - Value set via `FakeData.setFakeDataType()`
3. **Environment variable** - `JAHIA_CYPRESS_INJECTION_TYPE` from CI/CD
4. **Default** - Falls back to `'faker'` if nothing is set

### Priority Diagram

```
FakeData.get({ type: 'xss', ... })
    ↓
Has explicit type? → YES → Use 'xss'
    ↓ NO
Runtime config set? → YES → Use getFakeDataType() value
    ↓ NO
Env var set? → YES → Use JAHIA_CYPRESS_INJECTION_TYPE
    ↓ NO
Use default → 'faker'
```

### Runtime Configuration

Set the injection type programmatically in your tests:

```typescript
// In e2e.js or before() hook
FakeData.setInjectionsType('xss');

...

// All subsequent calls use XSS
it('test 1', () => {
    const data = FakeData.get('person.lastName'); // Uses XSS
});

it('test 2', () => {
    const data = FakeData.get({entity: 'person.firstName', length: 50}); // Uses XSS with length 50
});

// Override for specific call
it('test 3', () => {
    const data = FakeData.get({type: 'sql'}); // Uses SQL instead
});
```

### CI/CD Configuration

Configure the default injection type via environment variable:

#### Using Cypress Config

```javascript
// cypress.config.js
export default {
    env: {
        JAHIA_CYPRESS_INJECTION_TYPE: 'xss'
    }
};
```

#### Using Command Line

```bash
# Run tests with XSS injections
cypress run --env JAHIA_CYPRESS_INJECTION_TYPE=xss

# Run tests with SQL injections
cypress run --env JAHIA_CYPRESS_INJECTION_TYPE=sql
```

#### Using Environment Variables

```bash
# Export for entire pipeline
export CYPRESS_JAHIA_CYPRESS_INJECTION_TYPE=xss
cypress run
```

#### Docker/CI Pipeline

```yaml
# .gitlab-ci.yml example
security-tests:
  script:
    - export CYPRESS_JAHIA_CYPRESS_INJECTION_TYPE=xss
    - npm run test:e2e
```

```yaml
# GitHub Actions example
- name: Run XSS Tests
  run: npm run test:e2e
  env:
    CYPRESS_JAHIA_CYPRESS_INJECTION_TYPE: xss
```

---

## Available Injection Types

| Type | Description | Source File |
|------|-------------|-------------|
| `xss` | Cross-Site Scripting attack vectors | `fixtures/injections/xss-data.txt` |
| `sql` | SQL injection payloads | `fixtures/injections/sql-data.txt` |
| `bash` | Bash command injection | `fixtures/injections/bash-data.txt` |
| `chars` | Special characters and encoding tests | `fixtures/injections/chars-data.txt` |
| `htmlentities` | HTML entity encoding tests | `fixtures/injections/htmlentities-data.txt` |
| `numbers` | Numeric edge cases (overflow, underflow, etc.) | `fixtures/injections/numbers-data.txt` |

---

## Length Parameter Behavior

| Value | Behavior | Example |
|-------|----------|---------|
| `undefined` | Random 3-6 items joined | `FakeData.get({ type: 'xss' })` |
| `-1` | All available payloads | `FakeData.get({ type: 'xss', length: -1 })` |
| `> 0` | String up to exact length | `FakeData.get({ type: 'xss', length: 100 })` |

### Length Examples

```typescript
// Random 3-6 XSS payloads
const short = FakeData.get({type: 'xss'});
// Result: "<script>alert(1)</script>'\"><script>alert(2)</script>"

// Exactly 500 characters of SQL payloads
const medium = FakeData.get({type: 'sql', length: 500});
// Result: "' OR '1'='1'; DROP TABLE users;--' OR '1'='1..." (trimmed to 500 chars)

// All available bash injections
const all = FakeData.get({type: 'bash', length: -1});
// Result: All 200+ bash injection payloads joined
```

---

## Best Practices

### Call `FakeData.enable()` **once globally** in `cypress/e2e.js`, not in every test or beforeEach() hook (for performance optimization)
### 

```typescript
// ✅ GOOD - Enable once globally
// cypress/e2e.js
import {FakeData} from '@jahia/cypress';
FakeData.enable();

// ❌ BAD - Don't enable in every test: unnecessary, since data is cached
beforeEach(() => {
    FakeData.enable();
});
```

### Replace all hardcoded string values or Faker.js calls with `FakeData.get()` method
```typescript
it('should test user creation with injections', () => {
    // Use faker for realistic data instead of hardcoded one
    // You will be able to override data type globally afterwards 
    // for Injections testing

    // ❌ BAD - Not scalable
    const firstName = 'John';
    const lastName = 'Doe';
    const username = faker.internet.username();

    // ✅ GOOD - Providesd an opportunity to use the same tests for functional or security testing
    const firstName = FakeData.get('person.firstName');
    const lastName = FakeData.get('person.lastName');
    const lastName = FakeData.get('internet.username');
    
    ...
```

### Use **explicit types** for critical flows when **explicit Injection** usage is needed
```typescript
describe('XSS Protection', () => {
    it('should sanitize input fields', () => {
        const xss = FakeData.get({type: 'xss', length: 100});
        
        cy.visit('/form');
        cy.get('#name').type(xss);
        // validate afterwards
    });
});
```
### Combine faker + injections when needed
```typescript
it('should test user creation with injections', () => {
    // Use faker for realistic base data
    const firstName = FakeData.get('person.firstName');
    const lastName = FakeData.get('person.lastName');
    
    // Add XSS payload to email
    const xssPayload = FakeData.get({type: 'xss', length: 50});
    const email = `${firstName}.${lastName}.${xssPayload}@test.com`;
    
    cy.get('#email').type(email);
});
```
### Use runtime configuration for Injections-specific specs, development or debugging
```typescript
// Call FakeData.setInjectionsType() from either cypress/e2e.js or before() hook
// to run the same tests with different types of data or injections
FakeData.setInjectionsType('xss');
```
### Use the same tests codebase for different test runs (security vs. functional) - configure via CI/CD
```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

jobs:
  functional-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Functional Tests
        run: npm run test:e2e
        env:
          CYPRESS_JAHIA_CYPRESS_INJECTION_TYPE: faker
  
  security-xss-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run XSS Security Tests
        run: npm run test:e2e:security
        env:
          CYPRESS_JAHIA_CYPRESS_INJECTION_TYPE: xss
  
  security-sql-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run SQL Injection Tests
        run: npm run test:e2e:security
        env:
          CYPRESS_JAHIA_CYPRESS_INJECTION_TYPE: sql
```

---

## Performance Characteristics

- **First Load**: ~100-200ms to read all injection files
- **Cached Access**: <1ms (data stored in Cypress env)
- **Memory Usage**: ~50KB for all injection payloads
- **Cross-Spec Persistence**: Data persists across different spec files in same run

---

## Troubleshooting

### Error: "No injection data found for type: xss"

**Cause:** `FakeData.enable()` was not called before using injection types.

**Solution:**
```typescript
// Add to cypress/e2e.js
FakeData.enable();
```

---

### Error: "Invalid faker method: person.fakeMethod"

**Cause:** The faker entity path doesn't exist in the faker.js library.

**Solution:** Check [Faker.js API documentation](https://fakerjs.dev/api/) for valid methods.

---

### Injection data is empty/undefined

**Cause:** Fixture files are missing or path is incorrect.

**Solution:** Verify fixture files exist at:
```
node_modules/@jahia/cypress/fixtures/injections/
├── xss-data.txt
├── sql-data.txt
├── bash-data.txt
├── chars-data.txt
├── htmlentities-data.txt
└── numbers-data.txt
```

## See Also

- [Faker.js Documentation](https://fakerjs.dev/)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
