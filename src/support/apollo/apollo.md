# apolloQuery / apolloMutate 

These commands execute a GraphQL query/mutation through Apollo client.

> If no client is specified, a default Apollo client will be created and reused across the test.
> A custom client can be created with `cy.apolloClient()` before running this command, 
> or it can also be chained off of `cy.apolloClient()`.

## Syntax


### Usage

```
cy.apolloQuery(queryOptions)
cy.apolloMutate(mutationOptions)
cy.apolloClient().apolloMutate(mutationOption)
cy.apolloClient().apolloQuery(queryOptions)
```

### Arguments

#### &gt; options (`QueryOptions` | `MutationOptions`)

The query or mutation options, containing query/mutation itself, variables, and other fields as defined in Apollo API.

### Yields

The Apollo Query or Mutation result object (`ApolloQueryResult` / `FetchResult`)

## Examples

### Query

```
    cy.apolloQuery({
        query: gql`admin {
            jahia {
                version { 
                    build 
                }
            }
        }`
    }).its('data.admin.jahia.version.build').should('not.be.empty')
```

### Mutation

```
    cy.apolloMutate({
        variables: {
            timeout: 2,
        },
        mutation: gql`admin {
            jahia {
                shutdown(timeout:$timeout)
            }
        }`
    }).should((response) => {
        expect(response.data.admin.jahia.shutdown).to.be.false
    })
```

## Rules

### Requirements

- `cy.apolloQuery()` can be chained off of `cy` or `cy.apolloClient()`.

### Assertions

### Timeouts

## Command Log

When clicking on `apQuery` within the command log, the console outputs the following:

- `Options`: the passed options
- `Yielded`: the full result
