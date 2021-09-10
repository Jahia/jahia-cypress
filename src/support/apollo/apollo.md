# apollo

These commands execute a GraphQL query/mutation through Apollo client.

> If no client is specified, a default Apollo client will be created and reused across the test.
> A custom client can be created with `cy.apolloClient()` before running this command, 
> or it can also be chained off of `cy.apolloClient()`.

## Syntax


### Usage

```
cy.apollo(queryOptions)
cy.apollo(mutationOptions)
cy.apolloClient().apollo(mutationOption)
cy.apolloClient().apollo(queryOptions)
```

### Arguments

#### &gt; options (`QueryOptions | MutationOptions | FileQueryOptions | FileMutationOptions`)

The query or mutation options, containing query/mutation itself, variables, and other fields as defined in Apollo API.

You can replace `query` by `queryFile` and `mutation` by `mutationFile` to use a fixture containing the query/mutation.

### Yields

The Apollo Query or Mutation result object (`ApolloQueryResult` / `FetchResult`)

## Examples

### Query

```
    cy.apollo({
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
    cy.apollo({
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

- `cy.apollo()` can be chained off of `cy` or `cy.apolloClient()`.

### Assertions

### Timeouts

## Command Log

When clicking on `apollo` within the command log, the console outputs the following:

- `Options`: the passed options
- `Yielded`: the full result
