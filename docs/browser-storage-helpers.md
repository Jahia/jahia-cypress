# Browser Storage Helpers

## Overview

The Browser Storage Helpers module provides Cypress custom commands for debugging and managing browser storage (`cookies`, `localStorage`, `sessionStorage`). These commands are intended for **interactive debugging** and log full values by design, making full visibility available during test development and troubleshooting.

**Warning**: Use with caution in automated tests to avoid exposing sensitive data (tokens, credentials, session IDs) in logs and CI/CD artifacts.

## Features

- **Cookie Inspection**: List all cookies or inspect a specific cookie with detailed metadata
- **Storage Logging**: View full contents of `localStorage` and `sessionStorage` by origin
- **Selective Cleanup**: Clear session or persistent cookies independently
- **Browser State Management**: Simulate browser close or perform full reset for test isolation
- **Detailed Logging**: Formatted output with visual indicators for security attributes

## Functions

### `cy.logAllCookies()`

Logs all available cookies with comprehensive metadata and values.

**Usage:**
```typescript
it('should inspect all cookies', () => {
  cy.login();
  cy.logAllCookies();
  // Displays all cookies with their properties in the Cypress log
});
```

**Output Example:**
```
COOKIES REPORT - Total: 3
📊 Session Cookies: 1
📊 Persistent Cookies: 2

------------------------------------------------------------
Cookie: JSESSIONID
------------------------------------------------------------
Type:       Session
Value:      abc123def456
Domain:     localhost
Path:       /
Secure:     ✘ No
HttpOnly:   ✔ Yes
SameSite:   (not set)
Expires:    When browser closes (session cookie)

------------------------------------------------------------
Cookie: user_prefs
------------------------------------------------------------
Type:       Persistent
Value:      theme=dark
Domain:     localhost
Path:       /
Secure:     ✔ Yes
HttpOnly:   ✘ No
SameSite:   Strict
Expires:    2025-06-15T10:30:00.000Z
Days left:  45 days
Unix time:  1750156200
```

**Returns:** `Cypress.Chainable<void>` - Cypress chainable resolved when logging is complete

**Use Cases:**
- Verify authentication cookies are present after login
- Check cookie security attributes (Secure, HttpOnly, SameSite)
- Inspect cookie lifetime and expiration
- Confirm expected cookies are being set by the application

---

### `cy.logCookie(cookieName)`

Logs a specific cookie by name with detailed formatting.

**Parameters:**
- `cookieName` (string): Name of the cookie to inspect

**Usage:**
```typescript
it('should inspect a specific cookie', () => {
  cy.login();
  cy.logCookie('auth_token');
  // Logs only the auth_token cookie
});
```

**Returns:** `Cypress.Chainable<void>` - Cypress chainable resolved when logging is complete

**Use Cases:**
- Quickly inspect a known cookie
- Verify specific cookie values during test execution
- Debug why a particular cookie is not being set
- Monitor security attributes of critical cookies

---

### `cy.clearCookiesByType(type)`

Clears cookies based on their persistence type (session or persistent).

**Parameters:**
- `type` (string, optional): `'session'` or `'persistent'`. Default: `'session'`

**Usage:**
```typescript
it('should clear session cookies', () => {
  cy.login();
  cy.clearCookiesByType('session');
  // Clears only session cookies, keeps persistent cookies
});

it('should clear persistent cookies', () => {
  cy.clearCookiesByType('persistent');
  // Clears only persistent cookies
});
```

**Returns:** `Cypress.Chainable<void>` - Cypress chainable resolved when clearing is complete

**Use Cases:**
- Remove session cookies while preserving user preferences (persistent cookies)
- Clean up persistent cookies after a test
- Test cookie-based session recovery
- Verify application behavior with specific cookie types cleared

---

### `cy.simulateBrowserClose()`

Simulates a browser close by clearing session storage and session cookies only. Persistent cookies are intentionally retained.

**Usage:**
```typescript
it('should test session persistence across browser close', () => {
  cy.login();
  cy.logAllCookies(); // Show initial state
  
  cy.simulateBrowserClose();
  // Session storage and session cookies are cleared
  // Persistent cookies and localStorage remain
  
  cy.logAllCookies(); // Verify session cookies are gone
});
```

**What Gets Cleared:**
- ✔ All `sessionStorage` entries
- ✔ Session cookies only
- ✘ `localStorage` (intentionally retained)
- ✘ Persistent cookies (intentionally retained)

**Returns:** `void`

**Use Cases:**
- Test application behavior when browser is closed and reopened
- Verify session recovery using persistent cookies or localStorage
- Ensure session-specific data is properly cleared
- Test graceful handling of expired sessions
- Validate "remember me" functionality

**Note:** This is a more targeted alternative to `resetBrowserState()` for simulating a real browser close scenario.

---

### `cy.resetBrowserState()`

Resets the entire browser client-side state by clearing all storages and all cookies (both session and persistent).

**Usage:**
```typescript
it('should test with completely clean browser state', () => {
  cy.login();
  cy.resetBrowserState();
  // All cookies and storage cleared
  
  cy.visit('/');
  cy.get('[data-testid="login-prompt"]').should('be.visible');
  // User should be logged out with no stored state
});

it('should isolate tests with full reset', () => {
  cy.resetBrowserState();
  // Equivalent to fresh browser profile for this test
});
```

**What Gets Cleared:**
- ✔ All `localStorage` entries across all origins
- ✔ All `sessionStorage` entries across all origins
- ✔ All cookies (both session and persistent)

**Returns:** `void`

**Use Cases:**
- Complete test isolation between scenarios
- Simulate fresh user profile for new user flows
- Remove all authentication state before testing login
- Clean test environment before critical test suites
- Reset after destructive operations in tests

---

### `cy.logSessionStorage()`

Logs all `sessionStorage` entries grouped by origin.

**Usage:**
```typescript
it('should inspect session storage', () => {
  cy.visit('/dashboard');
  cy.logSessionStorage();
  // Displays all sessionStorage data
});
```

**Output Example:**
```
sessionStorage: {
  "http://localhost:3000": {
    "ui.theme": "dark",
    "ui.sidebar": "collapsed",
    "temp.search": "[\"query1\",\"query2\"]"
  }
}
```

**Returns:** `Cypress.Chainable<void>` - Cypress chainable resolved when logging is complete

**Use Cases:**
- Debug temporary session state
- Verify UI preferences are stored in session storage
- Inspect application cache stored in sessionStorage
- Monitor session-specific data structures
- Track temporary form state

**Warning:** `sessionStorage` is cleared when the tab closes, so this data is often sensitive to test execution order.

---

### `cy.logLocalStorage()`

Logs all `localStorage` entries grouped by origin.

**Usage:**
```typescript
it('should inspect local storage', () => {
  cy.visit('/settings');
  cy.logLocalStorage();
  // Displays all localStorage data
});
```

**Output Example:**
```
localStorage: {
  "http://localhost:3000": {
    "user.preferences": "{\"language\":\"en\",\"timezone\":\"UTC\"}",
    "app.version": "1.2.3",
    "theme.dark_mode": "true"
  }
}
```

**Returns:** `Cypress.Chainable<void>` - Cypress chainable resolved when logging is complete

**Use Cases:**
- Debug user preferences stored locally
- Verify application configuration storage
- Inspect theme settings and user customizations
- Monitor offline data caches
- Verify localStorage persistence across sessions

---

## Best Practices

### Security & Sensitive Data

1. **Avoid Logging in CI/CD**
   ```typescript
   it('should store auth token', () => {
     cy.login();
     
     // This logs sensitive token to test output!
     // ❌ cy.logAllCookies();
     
     // Better: Only check in CI if necessary
     // ✅ Only use cy.logCookie in local debugging
   });
   ```

2. **Check Log Output**
   - Review Cypress test runner logs for exposed secrets
   - Sanitize CI/CD pipeline logs capturing sensitive data
   - Use environment-based secrets, not hardcoded values
   - Consider enabling browser storage helpers only in debug mode

3. **Testing Sensitive Operations**
   ```typescript
   // Test that sensitive data isn't stored unnecessarily
   it('should not store password in storage', () => {
     cy.login('user@example.com', 'password123');
     cy.logLocalStorage().then(() => {
       // Manually verify password is NOT in logs
     });
   });
   ```

---

## Integration Examples

### Authentication Debugging

```typescript
describe('Authentication Flow', () => {
  it('should maintain session after page reload', () => {
    cy.step('Login', () => {
      cy.login('testuser@example.com', 'password');
      cy.logCookie('JSESSIONID');
      cy.get('[data-testid="dashboard"]').should('be.visible');
    });
    
    cy.step('Reload page', () => {
      cy.reload();
      cy.logCookie('JSESSIONID');
      cy.get('[data-testid="dashboard"]').should('be.visible');
      // Session cookie should still be present
    });
  });

  it('should clear credentials on logout', () => {
    cy.login();
    cy.logAllCookies();
    
    cy.get('[data-testid="logout-button"]').click();
    
    cy.logAllCookies();
    // Verify auth cookies are removed
  });
});
```

### User Preferences Debugging

```typescript
describe('User Preferences', () => {
  it('should persist theme preference across sessions', () => {
    cy.login();
    
    cy.step('Set dark theme', () => {
      cy.get('[data-testid="theme-toggle"]').click();
      cy.logLocalStorage();
    });
    
    cy.step('Verify persistence', () => {
      cy.reload();
      cy.logLocalStorage();
      cy.get('body').should('have.class', 'dark-theme');
    });
  });
});
```

### Test Isolation

```typescript
describe('Shopping Cart', () => {
  beforeEach(() => {
    cy.resetBrowserState();
    cy.visit('/shop');
  });

  it('should add item to cart', () => {
    cy.logLocalStorage(); // Should be empty
    cy.get('[data-testid="add-to-cart"]').first().click();
    cy.logLocalStorage(); // Should have cart data
  });

  it('should start with empty cart', () => {
    // Previous test's cart is not present due to resetBrowserState()
    cy.logLocalStorage();
    cy.get('[data-testid="cart-badge"]').should('have.text', '0');
  });
});
```

---

## API Reference

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `cy.logAllCookies()` | — | `Cypress.Chainable<void>` | Logs all cookies with full metadata |
| `cy.logCookie(name)` | `string` | `Cypress.Chainable<void>` | Logs specific cookie by name |
| `cy.clearCookiesByType(type)` | `'session'\|'persistent'` | `Cypress.Chainable<void>` | Clears cookies by type |
| `cy.simulateBrowserClose()` | — | `void` | Clears session storage and session cookies |
| `cy.resetBrowserState()` | — | `void` | Clears all storage and all cookies |
| `cy.logSessionStorage()` | — | `Cypress.Chainable<void>` | Logs all sessionStorage data |
| `cy.logLocalStorage()` | — | `Cypress.Chainable<void>` | Logs all localStorage data |

---

## TypeScript Declarations

All browser storage helpers are available on the global `cy` object through the extended Cypress `Chainable` interface:

```typescript
declare global {
    namespace Cypress {
        interface Chainable {
            logAllCookies(): Chainable<void>;
            logCookie(cookieName: string): Chainable<void>;
            clearCookiesByType(type?: 'session' | 'persistent'): Chainable<void>;
            simulateBrowserClose(): Chainable<void>;
            resetBrowserState(): Chainable<void>;
            logSessionStorage(): Chainable<void>;
            logLocalStorage(): Chainable<void>;
        }
    }
}
```
