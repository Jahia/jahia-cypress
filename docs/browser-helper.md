# Browser Helpers

## Overview

The Browser Helpers module provides exported helper functions for debugging and managing browser storage (`cookies`, `localStorage`, `sessionStorage`) in Cypress tests.

Warning: These helpers log full storage/cookie values by design. Use carefully in automated runs to avoid leaking tokens, credentials, or session identifiers in logs.

## Import and Usage Model

```typescript
import {BrowserHelper} from '@jahia/cypress';

it('inspects browser state', () => {
  cy.login();
  BrowserHelper.logCookies();
  BrowserHelper.logLocalStorage();
});
```

## Available Helpers

### `BrowserHelper.logCookies()`

Logs all available cookies with metadata and values.

- Returns: `Cypress.Chainable<void>`
- Typical use: inspect authentication and security cookie attributes during debugging

### `BrowserHelper.logCookie(cookieName)`

Logs one cookie by name in a detailed format.

- Parameters: `cookieName: string`
- Returns: `Cypress.Chainable<void>`

### `BrowserHelper.clearSessionCookies()`

Clears only session cookies.

- Returns: `Cypress.Chainable<void>`

### `BrowserHelper.clearPersistentCookies()`

Clears only persistent cookies.

- Returns: `Cypress.Chainable<void>`

### `BrowserHelper.simulateClose()`

Simulates a browser close by clearing `sessionStorage` and session cookies only.

- Returns: `void`
- Clears: session cookies + all `sessionStorage`
- Keeps: persistent cookies + `localStorage`

### `BrowserHelper.resetState()`

Resets browser client-side state by clearing all cookies and all storages.

- Returns: `void`
- Clears: all cookies + all `localStorage` + all `sessionStorage`

### `BrowserHelper.logSessionStorage()`

Logs all `sessionStorage` entries grouped by origin.

- Returns: `Cypress.Chainable<void>`

### `BrowserHelper.logLocalStorage()`

Logs all `localStorage` entries grouped by origin.

- Returns: `Cypress.Chainable<void>`

## Integration Examples

### Authentication Debugging

```typescript
import {BrowserHelper} from '@jahia/cypress';

describe('Authentication Flow', () => {
  it('keeps session after reload', () => {
    cy.step('Login', () => {
      cy.login('testuser@example.com', 'password');
      BrowserHelper.logCookie('JSESSIONID');
      cy.get('[data-testid="dashboard"]').should('be.visible');
    });

    cy.step('Reload page', () => {
      cy.reload();
      BrowserHelper.logCookie('JSESSIONID');
      cy.get('[data-testid="dashboard"]').should('be.visible');
    });
  });
});
```

### Simulate Browser Close

```typescript
import {BrowserHelper} from '@jahia/cypress';

it('validates behavior after browser close', () => {
  cy.login();
  BrowserHelper.logCookies();

  BrowserHelper.simulateClose();

  BrowserHelper.logCookies();
  BrowserHelper.logSessionStorage();
});
```

### Full State Reset for Isolation

```typescript
import {BrowserHelper} from '@jahia/cypress';

describe('Shopping Cart', () => {
  beforeEach(() => {
    BrowserHelper.resetState();
    cy.visit('/shop');
  });

  it('starts with empty browser state', () => {
    BrowserHelper.logLocalStorage();
    cy.get('[data-testid="cart-badge"]').should('have.text', '0');
  });
});
```

## Best Practices

1. Use these helpers for interactive debugging, not as regular test assertions.
2. Avoid running full storage/cookie logging in CI unless required.
3. Prefer targeted checks (`logCookie`) over full dumps (`logCookies`) for sensitive environments.
4. Use `resetState()` for hard test isolation, and `simulateClose()` for realistic session lifecycle checks.

## API Reference

| Helper | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `BrowserHelper.logCookies()` | - | `Cypress.Chainable<void>` | Logs all cookies with full metadata |
| `BrowserHelper.logCookie(cookieName)` | `string` | `Cypress.Chainable<void>` | Logs one cookie by name |
| `BrowserHelper.clearSessionCookies()` | - | `Cypress.Chainable<void>` | Clears session cookies only |
| `BrowserHelper.clearPersistentCookies()` | - | `Cypress.Chainable<void>` | Clears persistent cookies only |
| `BrowserHelper.simulateClose()` | - | `void` | Clears session storage and session cookies |
| `BrowserHelper.resetState()` | - | `void` | Clears all storages and all cookies |
| `BrowserHelper.logSessionStorage()` | - | `Cypress.Chainable<void>` | Logs all session storage data |
| `BrowserHelper.logLocalStorage()` | - | `Cypress.Chainable<void>` | Logs all local storage data |
