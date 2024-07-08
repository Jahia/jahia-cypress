# apolloClient

This commands create a new apollo client

## Syntax

```
cy.apolloClient()
```


### Usage

### Arguments

#### &gt; config (`HostConfig`)

If no authorization is passed, will use root credentials and cypress base url. Otherwise :

- token: An API token
- username
- password 
- url

#### &gt; options (`ApolloClientOptions`)

- `log` : should the command be logged or not
- `setCurrentApolloClient` : will set the created client to the `currentApolloClient` alias 

### Yields

The Apollo Client

## Examples

```
cy.apolloClient()
```

## Rules

### Requirements

- `cy.apolloClient()` requires being chained off of `cy`.

### Assertions

### Timeouts

## Command Log

When clicking on `apClient` within the command log, the console outputs the following:

- `Auth`: the authentication used
- `Yielded`: the apollo client
