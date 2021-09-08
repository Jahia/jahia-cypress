# executeGroovy

This commands execute a groovy script from fixtures folder

> It's using the runProvisioningScript command to execute a single groovy script

## Syntax

### Usage

```
cy.executeGroovy('script.groovy')
```

### Arguments

#### &gt; script (`string`)

The name of the script file, in fixtures folder

### Yields

The groovy script result (set with `setResult()` within groovy code)

## Examples

Will execute the `script.groovy` from fixtures folder and log the result :

```
cy.executeGroovy("script.groovy").then(result => { console.log(result) })
```

## Rules

### Requirements

- `cy.executeGroovy()` requires being chained off of `cy`.

### Assertions

### Timeouts

## Command Log

No log