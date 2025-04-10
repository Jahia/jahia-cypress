# runProvisioningScript

This command executes a provisioning script.

> This can be used to install modules, import sites, execute Groovy/GraphQL/SQL scripts with the help of the provisioning REST API.

## Syntax

### Usage

```javascript
cy.runProvisioningScript({
    script: { fileName: 'prov.yaml', type: 'application/yaml' }
});

cy.runProvisioningScript({
    script: { fileName: 'prov.yaml', type: 'application/yaml' },
    files: [{ fileName: 'file1.zip' }]
});

cy.runProvisioningScript({
    script: { fileContent: '- startBundle: "module"', type: 'application/yaml' }
});

cy.runProvisioningScript({
    script: { fileContent: '- startBundle: "module"', type: 'application/yaml' },
    jahiaServer: { url: 'http://jahia-processing.jahia.net:8080', username: 'root', password: 'root1234' }
});
```

### Arguments

#### `script` (`FormFile`)

The script can be specified either from an external file (using `fileName`) or inline (using `fileContent`).

- **fileName**: (`string`) - The name of the script file, located in the `fixtures` folder.
- **fileContent**: (`string`) - The content of the script. If specified, `fileName` is ignored.
- **type**: (`string`) - Content type, either `application/yaml` or `application/json`.

#### `jahiaServer` (`JahiaServer`)

A Jahia server can be specified if there is a need to use something other than the default. This is useful when using Jahia in a cluster, or if there is a need to redirect a provisioning script to a specific Jahia server (e.g., a processing node).

- **url**: (`string`) - The URL of the server (e.g., `http://processing.jahia.net:8080`).
- **username**: (`string`) - The root username.
- **password**: (`string`) - The password for the root user.

#### `files` (`FormFile[]`)

Additional files that can be referenced in the script. When an operation requires a URL, directly specify the file name (without protocol) to use one of these files.

- **fileName**: (`string`) - The name of the file, located in the `fixtures` folder.
- **fileContent**: (`string`) - The content of the file. If specified, `fileName` is ignored.
- **type**: (`string`) - The content type of the file.

#### `options` (`Cypress.Loggable`)

Options for the Cypress command.

- **log**: (`boolean`) - Indicates whether the command should be logged or not.

#### `requestOptions` (`Partial<RequestOptions>`)

Additional options for the Cypress request object. Some useful ones include:

- **failOnStatusCode**: (`boolean`) - Useful when you expect a 4xx or 5xx error and need to test it.
- **timeout**: (`number`) - Useful when you need control over the timeout of the request.

### Yields

The provisioning script result, as a JSON object.

## Examples

### Execute a Script

Will run the script in `fixtures/provisioning/test.yaml`:

```javascript
cy.runProvisioningScript({
    script: { fileName: 'provisioning/test.yaml', type: 'application/yaml' }
});
```

### Inline Script with Additional File

Will install the bundle in `fixtures/bundle.jar`:

```javascript
cy.runProvisioningScript({
    script: { fileContent: '- installBundle: "bundle.jar"', type: 'application/yaml' },
    files: [
        { fileName: 'bundle.jar', type: 'application/java-archive' }
    ]
});
```

### Use a Custom Jahia Server

Will run the script on a specific Jahia server:

```javascript
cy.runProvisioningScript({
    script: { fileName: 'prov.yaml', type: 'application/yaml' },
    jahiaServer: { url: 'http://custom-server.jahia.net:8080', username: 'admin', password: 'admin123' }
});
```

## Rules

### Requirements

- `cy.runProvisioningScript()` must be chained off of `cy`.

## Command Log

When clicking on `runProvisioningScript` within the command log, the console outputs the following:

- **Script**: The name and content of the script sent.
- **Files**: The name and content of every additional file sent.
- **Response**: The response from the REST call.
- **Yielded**: The JSON result yielded.