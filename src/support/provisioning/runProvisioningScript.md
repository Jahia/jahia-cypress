# runProvisioningScript

This commands execute a provisioning script

> This can be used to install modules, import sites, execute groovy/graphql/sql script with the help of the provisioning REST API

## Syntax

### Usage

```
cy.runProvisioningScript({fileName:'prov.yaml', type:'application/yaml'})
cy.runProvisioningScript({fileName:'prov.yaml', type:'application/yaml'}, [{fileName: 'file1.zip'}])
cy.runProvisioningScript({fileContent:'- startBundle: "module"', type:'application/yaml'})
cy.runProvisioningScript({fileContent:'- startBundle: "module"', type:'application/yaml'}, null, {url: 'http://jahia-processing.jahia.net:8080', username: 'root', password: 'root1234'})
```

### Arguments

#### &gt; script (`FormFile`)

The script can be specified either from an external file (using fileName) or inline (using fileContent)

- fileName: (`string`) : The name of the script file, in fixtures folder
- fileContent: (`string`) : The content of the script. If specified, fileName is ignored.
- type: (`string`) : Content type, either `application/yaml` or `application/json`

#### &gt; jahiaServer (`JahiaServer`)

A Jahia server can be specified if there is a need to use something other than default. This is useful when using Jahia in cluster, if there is a need to redirect a provisioning script to a specific Jahia server (for example a processig node).

- url: (`string`) : The url of the server (for example: http://processing.jahia.net:8080)
- username: (`string`) : Root user
- password: (`string`) : Password for the root user

#### &gt; files (`FormFile[]`)

Additional files that can be referenced in the script. When an operation requires a URL, directly specify the file name (without protocol) to use one these files

- fileName: (`string`) : The name of the file, in fixtures folder
- fileContent: (`string`) : The content of the file. If specified, fileName is ignored.
- type: (`string`) : Content type

#### &gt; options (`Loggable`)

- `log` : should the command be logged or not

#### &gt; timeout (`number`)

the timeout in milliseconds

#### &gt; requestOptions (`RequestOptions`)

Addition options for the cypress request object, some useful ones are:
- `failOnStatusCode` : useful when you expect a 4xx or 5xx error and need to test it

### Yields

The provisioning script result, as JSON object

## Examples

### Execute a script

Will run the script in `fixtures/provisioning/test.yaml` :

```
cy.runProvisioningScript({fileName:'provisioning/test.yaml', type:'application/yaml'})
```

### Inline script with additional file

Will install the bundle in `fixtures/bundle.jar` :

```
cy.runProvisioningScript(
    {fileContent: '- installBundle: "bundle.jar"',type: 'application/yaml'}, 
    [
        { fileName: "bundle.jar", type: 'application/java-archive' }
    ]
)
```

## Rules

### Requirements

- `cy.useProvisioningScript()` requires being chained off of `cy`.

### Assertions

### Timeouts

## Command Log

When clicking on `provScript` within the command log, the console outputs the following:

- `Script`: the name and content of the script sent
- `Files`: the name and content of every additional files sent
- `Response`: the response from the REST call
- `Yielded`: the JSON result yielded
