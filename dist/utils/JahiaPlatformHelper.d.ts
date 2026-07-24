/**
 * Fetches the Jahia version using a GraphQL query.
 * @returns Cypress.Chainable that resolves to the Jahia version record (e.g., release: "8.0.0", ...).
 * @note In rare cases tests might override baseUrl (e.g. when Jahia is configured with custom context path,
 *       but spec want to use just a host, without the context path), e.g.:
 *       it('Crawl pages', {baseUrl: serverURL.origin}, () => { ... })
 *       In such case(s) this call will fail because the GraphQL endpoint will not be found at the root of the host.
 *       To prevent such failure, we ensure GraphQL client uses full Jahia url as configured in env variable.
 */
export declare const getJahiaVersion: () => Cypress.Chainable;
export declare const getStartedModulesVersion: () => Cypress.Chainable;
export declare const getStartedModuleVersion: (moduleId: string) => Cypress.Chainable;
