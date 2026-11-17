# Session cleanup after each test

`registerSupport()` registers a hook that logs out the Jahia session a test leaves behind. The hook
sends `POST /cms/logout` when the browser holds a `JSESSIONID` cookie for the host of `baseUrl`.

## Why a test leaves a session open

Each call to `cy.login()` opens an HTTP session on Jahia. With `testIsolation`, Cypress clears the
cookies before the next test, but Jahia keeps the session until it times out, after 30 minutes by
default.

Jahia counts each open session against the limit of logged-in users of its license. The session of
`root` counts too, although the limit check does not apply to a login as `root`. The license that
ships in the `jahia/jahia-ee` image allows 25 logged-in users.

A suite that runs more than 25 tests with `cy.login()` in less than 30 minutes therefore reaches the
limit. After that, a login as any user other than `root` fails: `POST /cms/login` answers 200
instead of 302, and the Jahia log shows this warning:

```
The number of logged in users has reached the authorized limit while trying to login user <name>.
```

A call to `cy.apollo()`, `cy.executeGroovy()` or `cy.runProvisioningScript()` authenticates with
HTTP Basic credentials and opens no logged-in session.

## When the hook runs

- With `testIsolation` on, which is the default, the hook runs after each test.
- With `testIsolation: false`, the tests of a spec share their session, so the hook runs once after
  the spec.

Mocha runs an `afterEach` hook inside a `describe` block before the hooks of the support file, so
that cleanup hook still runs with the session of the test. An `afterEach` hook at the top level of a
spec file runs after the logout.

`cy.loginAndStoreSession()` stores its session with `cy.session()`, and a later test restores that
session. The hook keeps a session that `cy.loginAndStoreSession()` stored, and logs out any other.

## How to turn the hook off

Set the Cypress environment variable `JAHIA_LOGOUT_AFTER_TEST` to `false`:

```bash
CYPRESS_JAHIA_LOGOUT_AFTER_TEST=false npx cypress run
```
