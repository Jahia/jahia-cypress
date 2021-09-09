# @jahia/cypress

## Commands

[`.apolloClient()`](./src/support/apollo/apolloClient.md)

[`.apollo()`](./src/support/apollo/apollo.md)

[`.runProvisioningScript()`](./src/support/provisioning/runProvisioningScript.md)

[`.executeGroovy()`](./src/support/provisioning/executeGroovy.md)

[`.login()`](./src/support/login.md)

[`.logout()`](./src/support/logout.md)

## Page / component objects



## Configure

Add `@jahia/cypress` to your project.

Add cypress commands and support : in support/index.js, adds : 

```js
require('@jahia/cypress/dist/support/registerSupport').registerSupport()
```

Add typings in your tsconfig.json : 

```json
{
  "types": [
    "@jahia/cypress"
  ]
}
```

This project provides a plugin for settings environment variable based on system env ( `JAHIA_URL` and `SUPER_USER_PASSWORD` )
It also embeds `cypress-terminal-report` for better output.

To set-up : in `plugins/index.js`, calls the module in `@jahia/cypress/dist/plugins/registerPlugins` :

```js
module.exports = (on, config) => {
    require('@jahia/cypress/dist/plugins/registerPlugins').registerPlugins(on, config)
    
    // register other plugins
    
    return config;
};
```
