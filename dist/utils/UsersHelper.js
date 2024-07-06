"use strict";
exports.__esModule = true;
exports.addUserToGroup = exports.deleteUser = exports.createUser = exports.revokeRoles = exports.grantRoles = void 0;
var grantRoles = function (pathOrId, roleNames, principalName, principalType) {
    cy.log('Grant role(s) ' + roleNames + ' with principal type ' + principalType + ' to ' + principalName + ' on node ' + pathOrId);
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
var revokeRoles = function (pathOrId, roleNames, principalName, principalType) {
    cy.log('Revoke role(s) ' + roleNames + ' with principal type ' + principalType + ' to ' + principalName + ' on node ' + pathOrId);
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
var createUser = function (userName, password, properties) {
    if (properties === void 0) { properties = []; }
    var userProperties = properties.map(function (property) {
        return 'properties.setProperty("' + property.name + '", "' + property.value + '")';
    });
    cy.executeGroovy('groovy/admin/createUser.groovy', {
        USER_NAME: userName,
        PASSWORD: password ? password : 'password',
        USER_PROPERTIES: userProperties ? userProperties.join('\n') : ''
    });
};
exports.createUser = createUser;
var deleteUser = function (userName) {
    cy.executeGroovy('groovy/admin/deleteUser.groovy', {
        USER_NAME: userName
    });
};
exports.deleteUser = deleteUser;
var addUserToGroup = function (userName, groupName, siteKey) {
    cy.executeGroovy('groovy/admin/addUserToGroup.groovy', {
        USER_NAME: userName,
        GROUP_NAME: groupName,
        SITE_KEY: siteKey ? "\"" + siteKey + "\"" : 'null'
    });
};
exports.addUserToGroup = addUserToGroup;
