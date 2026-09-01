# Global Vars

Say you want some setup to run only once for an entire Cypress run, not once per spec file — for
example, "configure X, but only the first time, then leave it alone for every other spec." The
obvious tool for that is `Cypress.env()`: set a flag once, check it before doing the work again.

It doesn't quite work, though. Cypress reloads the spec's whole JS context between spec files, so
anything living in that browser memory — `Cypress.env()` included — gets wiped and starts fresh for
the next spec. Your flag never makes it past the file that set it.

What does survive for the whole run is the Node process behind Cypress's plugins
(`setupNodeEvents`) — it stays up the entire time, across every spec. `getGlobalVar`/`setGlobalVar`
are a small key/value store built on top of that process, so a value you set in one spec is still
there when a later spec asks for it. Use them for `string`, `number` or `boolean` flags/states you want shared across the whole run:
a "did we already configure X" flag, an immutable version one spec computes and a later one needs, etc.
Types, other than specified ones will be rejected on purpose due to security reasons. Use responsively, though: don't use it as a general-purpose database. It's just a small shared memory for flags and small values.

## Usage

Requires `registerPlugins()` from `@jahia/cypress` to be wired into your `setupNodeEvents`
(needed anyway for other `@jahia/cypress` features and already hooked up in all repos) — no extra setup beyond that.

```typescript
import {getGlobalVar, setGlobalVar} from '@jahia/cypress';

// store a value once (e.g. in a before() hook), shared by every later spec in this run
setGlobalVar('MY_FLAG', true);

// read it back later, in this or any other spec file
getGlobalVar<boolean>('MY_FLAG').then(value => {
    // value is `true`, or `null` if it was never set
});
```

he store lives in the plugins process, so its lifetime is that process's: a whole `cypress run`, or a whole `cypress open` session across repeated spec runs. A run split across several processes gets one store each.
