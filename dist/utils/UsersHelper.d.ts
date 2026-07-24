/**
 * Grants one or more roles to a principal on a target node.
 * @param {string} pathOrId JCR node path or identifier where roles are granted.
 * @param {Array<string>} roleNames Role names to grant.
 * @param {string} principalName Principal name (user or group) receiving roles.
 * @param {string} principalType Principal type expected by the mutation.
 * @returns {Cypress.Chainable} Cypress chainable for the GraphQL mutation request.
 */
export declare const grantRoles: (pathOrId: string, roleNames: Array<string>, principalName: string, principalType: string) => Cypress.Chainable;
/**
 * Revokes one or more roles from a principal on a target node.
 * @param {string} pathOrId JCR node path or identifier where roles are revoked.
 * @param {Array<string>} roleNames Role names to revoke.
 * @param {string} principalName Principal name (user or group) losing roles.
 * @param {string} principalType Principal type expected by the mutation.
 * @returns {Cypress.Chainable} Cypress chainable for the GraphQL mutation request.
 */
export declare const revokeRoles: (pathOrId: string, roleNames: Array<string>, principalName: string, principalType: string) => Cypress.Chainable;
/**
 * Creates a Jahia user using the Groovy fixture.
 * @param {string} userName Username of the user to create.
 * @param {string} password Password for the new user. Defaults to "password" when empty.
 * @param {{name: string, value: string}[]} properties Optional user properties to set on creation.
 * @param {string} siteKey Optional site key for site-scoped user creation.
 * @returns {void}
 */
export declare const createUser: (userName: string, password: string, properties?: {
    name: string;
    value: string;
}[], siteKey?: string) => void;
/**
 * Retrieves the JCR path of a user.
 * @param {string} username Username to look up.
 * @param {string} siteKey Optional site key for site-scoped users.
 * @returns {Cypress.Chainable} Cypress chainable containing the GraphQL query response.
 */
export declare const getUserPath: (username: string, siteKey?: string) => Cypress.Chainable;
/**
 * Deletes a Jahia user using the Groovy fixture.
 * @param {string} userName Username of the user to delete.
 * @returns {void}
 */
export declare const deleteUser: (userName: string) => void;
/**
 * Creates a Jahia users group using the Groovy fixture.
 * @param {string} groupName Group name to create.
 * @param {boolean} hidden Whether the group should be hidden.
 * @param {string} siteKey Optional site key for site-scoped group creation.
 * @returns {void}
 */
export declare const createGroup: (groupName: string, hidden?: boolean, siteKey?: string) => void;
/**
 * Deletes a Jahia users group using the Groovy fixture.
 * @param {string} groupName Group name to delete.
 * @param {string} siteKey Optional site key for site-scoped group deletion.
 * @returns {void}
 */
export declare const deleteGroup: (groupName: string, siteKey?: string) => void;
/**
 * Adds an existing user to a group using the Groovy fixture.
 * @param {string} userName Username to add to the group.
 * @param {string} groupName Group receiving the user.
 * @param {string} siteKey Optional site key for site-scoped group membership.
 * @returns {void}
 */
export declare const addUserToGroup: (userName: string, groupName: string, siteKey?: string) => void;
