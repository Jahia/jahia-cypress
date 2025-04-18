export const grantRoles = (pathOrId: string, roleNames: Array<string>, principalName: string, principalType: string): Cypress.Chainable => {
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

export const revokeRoles = (pathOrId: string, roleNames: Array<string>, principalName: string, principalType: string): Cypress.Chainable => {
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

export const createUser = (userName: string, password: string, properties: {
    name: string,
    value: string
}[] = []): void => {
    const userProperties = properties.map(property => {
        return 'properties.setProperty("' + property.name + '", "' + property.value + '")';
    });
    cy.executeGroovy('groovy/admin/createUser.groovy', {
        USER_NAME: userName,
        PASSWORD: password ? password : 'password',
        USER_PROPERTIES: userProperties ? userProperties.join('\n') : ''
    });
};

export const getUserPath = (username: string, siteKey = ''): Cypress.Chainable => {
    return cy.apollo({
        variables: {
            siteKey,
            username
        },
        queryFile: 'graphql/jcr/query/getUserPath.graphql'
    }
    );
};

export const deleteUser = (userName: string): void => {
    cy.executeGroovy('groovy/admin/deleteUser.groovy', {
        USER_NAME: userName
    });
};

export const createGroup = (groupName: string, hidden?: boolean, siteKey = ''): void => {
    cy.executeGroovy('groovy/admin/userGroupHelper.groovy', {
        OPERATION: 'create',
        GROUPNAME: groupName,
        HIDDEN: hidden ? 'true' : 'false',
        SITEKEY: siteKey
    });
};

export const deleteGroup = (groupName: string, siteKey = ''): void => {
    cy.executeGroovy('groovy/admin/userGroupHelper.groovy', {
        OPERATION: 'delete',
        GROUPNAME: groupName,
        SITEKEY: siteKey
    });
};

export const addUserToGroup = (userName: string, groupName: string, siteKey?: string): void => {
    cy.executeGroovy('groovy/admin/addUserToGroup.groovy', {
        USER_NAME: userName,
        GROUP_NAME: groupName,
        SITE_KEY: siteKey ? `"${siteKey}"` : 'null'
    });
};
