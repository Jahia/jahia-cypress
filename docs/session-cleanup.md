# Session cleanup after each test

`registerSupport()` registers hooks that log out the Jahia session a test leaves behind. A hook
sends `POST /cms/logout` when the browser holds a `JSESSIONID` cookie for the host of `baseUrl`.

## Why a test leaves a session open

Each call to `cy.login()` opens an HTTP session on Jahia. With `testIsolation`, Cypress clears the
cookies before the next test, but Jahia keeps the session until it times out, after 30 minutes by
default.

Jahia counts each logged-in session against the limit of logged-in users of its license. The
session of `root` counts too, although the limit check does not apply to a login as `root`. The
license that ships in the `jahia/jahia-ee` image allows 25 logged-in users.

A suite that runs more than 25 tests with `cy.login()` in less than 30 minutes therefore reaches the
limit. After that, a login as any user other than `root` fails: `POST /cms/login` answers 200
instead of 302, and the Jahia log shows this warning:

```
The number of logged in users has reached the authorized limit while trying to login user <name>.
```

A call to `cy.apollo()`, `cy.executeGroovy()` or `cy.runProvisioningScript()` authenticates with
HTTP Basic credentials. Such a call can get an HTTP session, as `src/support/jahiaLog.ts` describes,
but Jahia does not count that session as a logged-in user. A run of these calls against
`jahia/jahia-ee:8.2.3.0` left the number of logged-in sessions unchanged.

## When the hooks run

- With `testIsolation` on, which is the default, the hook logs out the session after each test.
- In a suite with `testIsolation: false`, the tests share their session. The hook keeps that
  session after each test and logs it out when the spec ends.
- `cy.session()` stores a session that a later test restores, and `cy.loginAndStoreSession()` calls
  it. The hook keeps each session that `cy.session()` creates or restores. Cypress clears these
  sessions between specs, so the hook logs them out when the spec ends.
- A session that `cy.session()` stores with `cacheAcrossSpecs: true` stays open, because a later
  spec restores it.
- With no `baseUrl` in the Cypress configuration, the hooks send nothing, and each session stays
  open until it times out.

Mocha runs an `afterEach` hook inside a `describe` block before the hooks of the support file. That
cleanup hook therefore still runs with the session of the test. An `afterEach` hook at the top level
of a spec file runs after the logout.

When Jahia answers the logout with a status of 400 or more, the hook writes the status in the
command log of Cypress. The test does not fail.

## How to turn the hooks off

Set the Cypress environment variable `JAHIA_LOGOUT_AFTER_TEST` to `false`. The boolean `false` and
the string `false` that a shell variable gives both turn the hooks off:

```bash
CYPRESS_JAHIA_LOGOUT_AFTER_TEST=false npx cypress run
```
