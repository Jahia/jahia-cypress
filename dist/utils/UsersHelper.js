"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addUserToGroup = exports.deleteGroup = exports.createGroup = exports.deleteUser = exports.getUserPath = exports.createUser = exports.revokeRoles = exports.grantRoles = void 0;
/**
 * Grants one or more roles to a principal on a target node.
 * @param {string} pathOrId JCR node path or identifier where roles are granted.
 * @param {Array<string>} roleNames Role names to grant.
 * @param {string} principalName Principal name (user or group) receiving roles.
 * @param {string} principalType Principal type expected by the mutation.
 * @returns {Cypress.Chainable} Cypress chainable for the GraphQL mutation request.
 */
var grantRoles = function (pathOrId, roleNames, principalName, principalType) {
    cy.log("Grant role(s) ".concat(roleNames, " with principal type ").concat(principalType, " to ").concat(principalName, " on node ").concat(pathOrId));
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
exports.grantRoles = grantRoles;
/**
 * Revokes one or more roles from a principal on a target node.
 * @param {string} pathOrId JCR node path or identifier where roles are revoked.
 * @param {Array<string>} roleNames Role names to revoke.
 * @param {string} principalName Principal name (user or group) losing roles.
 * @param {string} principalType Principal type expected by the mutation.
 * @returns {Cypress.Chainable} Cypress chainable for the GraphQL mutation request.
 */
var revokeRoles = function (pathOrId, roleNames, principalName, principalType) {
    cy.log("Revoke role(s) ".concat(roleNames, " with principal type ").concat(principalType, " to ").concat(principalName, " on node ").concat(pathOrId));
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
exports.revokeRoles = revokeRoles;
/**
 * Creates a Jahia user using the Groovy fixture.
 * @param {string} userName Username of the user to create.
 * @param {string} password Password for the new user. Defaults to "password" when empty.
 * @param {{name: string, value: string}[]} properties Optional user properties to set on creation.
 * @param {string} siteKey Optional site key for site-scoped user creation.
 * @returns {void}
 */
var createUser = function (userName, password, properties, siteKey) {
    if (properties === void 0) { properties = []; }
    if (siteKey === void 0) { siteKey = ''; }
    cy.log("Creating ".concat(siteKey === '' ? 'server-level ' : ('site-level:' + siteKey), " user with name ").concat(userName));
    var userProperties = properties.map(function (property) {
        return 'properties.setProperty("' + property.name + '", "' + property.value + '")';
    });
    cy.executeGroovy('groovy/admin/createUser.groovy', {
        USERNAME: userName,
        PASSWORD: password ? password : 'password',
        USER_PROPERTIES: userProperties ? userProperties.join('\n') : '',
        SITEKEY: siteKey
    });
};
exports.createUser = createUser;
/**
 * Retrieves the JCR path of a user.
 * @param {string} username Username to look up.
 * @param {string} siteKey Optional site key for site-scoped users.
 * @returns {Cypress.Chainable} Cypress chainable containing the GraphQL query response.
 */
var getUserPath = function (username, siteKey) {
    if (siteKey === void 0) { siteKey = ''; }
    cy.log("Getting user path for ".concat(username));
    return cy.apollo({
        variables: {
            siteKey: siteKey,
            username: username
        },
        queryFile: 'graphql/jcr/query/getUserPath.graphql'
    });
};
exports.getUserPath = getUserPath;
/**
 * Deletes a Jahia user using the Groovy fixture.
 * @param {string} userName Username of the user to delete.
 * @returns {void}
 */
var deleteUser = function (userName) {
    cy.log("Deleting user ".concat(userName));
    cy.executeGroovy('groovy/admin/deleteUser.groovy', {
        USERNAME: userName
    });
};
exports.deleteUser = deleteUser;
/**
 * Creates a Jahia users group using the Groovy fixture.
 * @param {string} groupName Group name to create.
 * @param {boolean} hidden Whether the group should be hidden.
 * @param {string} siteKey Optional site key for site-scoped group creation.
 * @returns {void}
 */
var createGroup = function (groupName, hidden, siteKey) {
    if (siteKey === void 0) { siteKey = ''; }
    cy.log("Creating ".concat(siteKey === '' ? 'server-level' : ('site-level:' + siteKey), " group ").concat(groupName));
    cy.executeGroovy('groovy/admin/userGroupHelper.groovy', {
        OPERATION: 'create',
        GROUPNAME: groupName,
        HIDDEN: hidden ? 'true' : 'false',
        SITEKEY: siteKey
    });
};
exports.createGroup = createGroup;
/**
 * Deletes a Jahia users group using the Groovy fixture.
 * @param {string} groupName Group name to delete.
 * @param {string} siteKey Optional site key for site-scoped group deletion.
 * @returns {void}
 */
var deleteGroup = function (groupName, siteKey) {
    if (siteKey === void 0) { siteKey = ''; }
    cy.log("Deleting ".concat(siteKey === '' ? 'server-level' : ('site-level:' + siteKey), " group ").concat(groupName));
    cy.executeGroovy('groovy/admin/userGroupHelper.groovy', {
        OPERATION: 'delete',
        GROUPNAME: groupName,
        SITEKEY: siteKey
    });
};
exports.deleteGroup = deleteGroup;
/**
 * Adds an existing user to a group using the Groovy fixture.
 * @param {string} userName Username to add to the group.
 * @param {string} groupName Group receiving the user.
 * @param {string} siteKey Optional site key for site-scoped group membership.
 * @returns {void}
 */
var addUserToGroup = function (userName, groupName, siteKey) {
    if (siteKey === void 0) { siteKey = ''; }
    cy.log("Add user ".concat(userName, " to ").concat(siteKey === '' ? 'server-level' : ('site-level:' + siteKey), " group ").concat(groupName));
    cy.executeGroovy('groovy/admin/addUserToGroup.groovy', {
        USERNAME: userName,
        GROUPNAME: groupName,
        SITEKEY: siteKey
    });
};
exports.addUserToGroup = addUserToGroup;
