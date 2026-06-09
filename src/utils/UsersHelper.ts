/**
 * Grants one or more roles to a principal on a target node.
 * @param {string} pathOrId JCR node path or identifier where roles are granted.
 * @param {Array<string>} roleNames Role names to grant.
 * @param {string} principalName Principal name (user or group) receiving roles.
 * @param {string} principalType Principal type expected by the mutation.
 * @returns {Cypress.Chainable} Cypress chainable for the GraphQL mutation request.
 */
export const grantRoles = (pathOrId: string, roleNames: Array<string>, principalName: string, principalType: string): Cypress.Chainable => {
    cy.log(`Grant role(s) ${roleNames} with principal type ${principalType} to ${principalName} on node ${pathOrId}`);
    return cy.apollo({
        variables: {
            pathOrId: pathOrId,
            roleNames: roleNames,
            principalName: principalName,
            principalType: principalType
        },
        mutationFile: 'graphql/jcr/mutation/grantRoles.graphql'
    });
};

/**
 * Revokes one or more roles from a principal on a target node.
 * @param {string} pathOrId JCR node path or identifier where roles are revoked.
 * @param {Array<string>} roleNames Role names to revoke.
 * @param {string} principalName Principal name (user or group) losing roles.
 * @param {string} principalType Principal type expected by the mutation.
 * @returns {Cypress.Chainable} Cypress chainable for the GraphQL mutation request.
 */
export const revokeRoles = (pathOrId: string, roleNames: Array<string>, principalName: string, principalType: string): Cypress.Chainable => {
    cy.log(`Revoke role(s) ${roleNames} with principal type ${principalType} to ${principalName} on node ${pathOrId}`);
    return cy.apollo({
        variables: {
            pathOrId: pathOrId,
            roleNames: roleNames,
            principalName: principalName,
            principalType: principalType
        },
        mutationFile: 'graphql/jcr/mutation/revokeRoles.graphql'
    });
};

/**
 * Creates a Jahia user using the Groovy fixture.
 * @param {string} userName Username of the user to create.
 * @param {string} password Password for the new user. Defaults to "password" when empty.
 * @param {{name: string, value: string}[]} properties Optional user properties to set on creation.
 * @param {string} siteKey Optional site key for site-scoped user creation.
 * @returns {void}
 */
export const createUser = (userName: string, password: string, properties: {name: string, value: string}[] = [], siteKey = ''): void => {
    cy.log(`Creating ${siteKey === '' ? 'server-level ' : ('site-level:' + siteKey)} user with name ${userName}`);
    const userProperties = properties.map(property => {
        return 'properties.setProperty("' + property.name + '", "' + property.value + '")';
    });
    cy.executeGroovy('groovy/admin/createUser.groovy', {
        USERNAME: userName,
        PASSWORD: password ? password : 'password',
        USER_PROPERTIES: userProperties ? userProperties.join('\n') : '',
        SITEKEY: siteKey
    });
};

/**
 * Retrieves the JCR path of a user.
 * @param {string} username Username to look up.
 * @param {string} siteKey Optional site key for site-scoped users.
 * @returns {Cypress.Chainable} Cypress chainable containing the GraphQL query response.
 */
export const getUserPath = (username: string, siteKey = ''): Cypress.Chainable => {
    cy.log(`Getting user path for ${username}`);
    return cy.apollo({
        variables: {
            siteKey,
            username
        },
        queryFile: 'graphql/jcr/query/getUserPath.graphql'
    }
    );
};

/**
 * Deletes a Jahia user using the Groovy fixture.
 * @param {string} userName Username of the user to delete.
 * @returns {void}
 */
export const deleteUser = (userName: string): void => {
    cy.log(`Deleting user ${userName}`);
    cy.executeGroovy('groovy/admin/deleteUser.groovy', {
        USERNAME: userName
    });
};

/**
 * Creates a Jahia users group using the Groovy fixture.
 * @param {string} groupName Group name to create.
 * @param {boolean} hidden Whether the group should be hidden.
 * @param {string} siteKey Optional site key for site-scoped group creation.
 * @returns {void}
 */
export const createGroup = (groupName: string, hidden?: boolean, siteKey = ''): void => {
    cy.log(`Creating ${siteKey === '' ? 'server-level' : ('site-level:' + siteKey)} group ${groupName}`);
    cy.executeGroovy('groovy/admin/userGroupHelper.groovy', {
        OPERATION: 'create',
        GROUPNAME: groupName,
        HIDDEN: hidden ? 'true' : 'false',
        SITEKEY: siteKey
    });
};

/**
 * Deletes a Jahia users group using the Groovy fixture.
 * @param {string} groupName Group name to delete.
 * @param {string} siteKey Optional site key for site-scoped group deletion.
 * @returns {void}
 */
export const deleteGroup = (groupName: string, siteKey = ''): void => {
    cy.log(`Deleting ${siteKey === '' ? 'server-level' : ('site-level:' + siteKey)} group ${groupName}`);
    cy.executeGroovy('groovy/admin/userGroupHelper.groovy', {
        OPERATION: 'delete',
        GROUPNAME: groupName,
        SITEKEY: siteKey
    });
};

/**
 * Adds an existing user to a group using the Groovy fixture.
 * @param {string} userName Username to add to the group.
 * @param {string} groupName Group receiving the user.
 * @param {string} siteKey Optional site key for site-scoped group membership.
 * @returns {void}
 */
export const addUserToGroup = (userName: string, groupName: string, siteKey = ''): void => {
    cy.log(`Add user ${userName} to ${siteKey === '' ? 'server-level' : ('site-level:' + siteKey)} group ${groupName}`);
    cy.executeGroovy('groovy/admin/addUserToGroup.groovy', {
        USERNAME: userName,
        GROUPNAME: groupName,
        SITEKEY: siteKey
    });
};
