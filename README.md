# @jahia/cypress

## Commands

[`.apollo()`](./src/support/apollo/apollo.md)

[`.apolloClient()`](./src/support/apollo/apolloClient.md)

[`.runProvisioningScript()`](./src/support/provisioning/runProvisioningScript.md)

[`.executeGroovy()`](./src/support/provisioning/executeGroovy.md)

[`.login()`](./src/support/login.md)

[`.logout()`](./src/support/logout.md)

## Page / component objects

In Page Object Model, a set of object is provided to handle known and reused web elements. 
These page objects provide method to handle interactions with these web elements. 
Web elements can be simple HTML elements, more complex UI components or full pages. 

This framework does not come with predefined page objects, as they should be provided by the modules which define them.
TODO: Moonstone page object are defined here, but could be moved to moonstone

### Implementation

#### Components

Page object representing a component extends `baseComponent`. 
Creating a page object will enqueue a command looking for the corresponding DOM element. 
An alias to this element will be stored in the object.

Page object can provide accessors to other page object, and methods that will enqueue other cypress commands and assertions.

[`moonstone`](./src/page-object/moonstone)

#### Pages

Page object representing an HTML page extends `basePage`.
They can provide a static visit() method to open the page, and returns an instance of the page object.
Constructor can initialize components that are present in the page. This will assert that these components are present, and make them available for the tests.

[`jcontent.md`](./src/page-object/jcontent/jcontent.ts)

### Sample usage

```typescript
const primaryNav = new PrimaryNav()  // Look for primary nav elements 
primaryNav.listItems().expect('...') // Check primary nav content
primaryNav.select('jcontent')        // Select the corresponding item and click on it
```


```typescript
let jcontent = JContent.visit("digitall", "en", "pages");
jcontent.select('content-folders')
const m = jcontent.getTable().getRow(1).contextMenu()
m.select('edit')
```

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
