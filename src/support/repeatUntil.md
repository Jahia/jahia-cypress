# repeatUntil

This commands reload or repeat a function until an item is visible in the page

## Syntax

### Usage

```
cy.repeatUntil('div:contains("some text")')
cy.repeatUntil('div:contains("some text")', {attempts: 10, reloadCallback: () => { cy.reload() }, delay: 1000})
```

### Arguments

#### &gt; selector (`string`)

The selector that is being searched in the page

#### &gt; options (`RepeatUntilOptions`)

- `attempts`: max number of attempts
- `callback`: the callback to execute if the item is not found. By default, do a `cy.reload()`
- `delay`: time to wait between each attemps (ms)

### Yields

The found element

## Rules

### Requirements

- `cy.repeatUntil()` requires being chained off of `cy`.

### Assertions

### Timeouts

## Command Log
