# executeGroovy

This commands execute a groovy script from fixtures folder

> It's using the runProvisioningScript command to execute a single groovy script

## Syntax

### Usage

```
cy.executeGroovy('script.groovy')
cy.executeGroovy('script.groovy', {url: 'http://jahia-processing.jahia.net:8080', username: 'root', password: 'root1234'})
```

### Arguments

#### &gt; script (`string`)

The name of the script file, in fixtures folder

#### &gt; jahiaServer (`JahiaServer`)

A Jahia server can be specified if there is a need to use something other than default. This is useful when using Jahia in cluster, if there is a need to redirect a provisioning script to a specific Jahia server (for example a processig node).

- url: (`string`) : The url of the server (for example: http://processing.jahia.net:8080)
- username: (`string`) : Root user
- password: (`string`) : Password for the root user

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