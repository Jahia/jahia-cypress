import {ApolloOptions} from '../support';
import {addNode, deleteNode} from './JCRHelper';

export type CreateRoleOptions = {
    /** Name of the role node under `/roles`, and the name `grantRoles` takes. */
    name: string;
    /** Value of `j:roleGroup`, such as `edit-role`, `site-role` or `server-role`. */
    roleGroup: string;
    /** Permissions granted on the node the role is granted on. */
    permissions?: string [];
    /** Permissions granted on the current site, whatever node the role is granted on. */
    sitePermissions?: string [];
    /** Value of `j:privilegedAccess`. */
    privilegedAccess?: boolean;
};

/**
 * Add a `jnt:role` under `/roles`. `sitePermissions` become a `currentSite-access` child, which is
 * how Jahia stores the permissions a role grants on the current site.
 *
 * @param options the role to add
 * @param apolloOptions options forwarded to `cy.apollo`
 * @returns the `addNode` mutation result
 */
export const createRole = (options: CreateRoleOptions, apolloOptions: ApolloOptions = {}): Cypress.Chainable => {
    const {name, roleGroup, permissions = [], sitePermissions = [], privilegedAccess = false} = options;
    cy.log(`Create role ${name}`);

    const children = sitePermissions.length === 0 ? [] : [{
        name: 'currentSite-access',
        primaryNodeType: 'jnt:externalPermissions',
        properties: [
            {name: 'j:path', type: 'STRING', value: 'currentSite'},
            {name: 'j:permissionNames', type: 'STRING', values: sitePermissions}
        ]
    }];

    return addNode({
        parentPathOrId: '/roles',
        name: name,
        primaryNodeType: 'jnt:role',
        properties: [
            {name: 'j:roleGroup', type: 'STRING', value: roleGroup},
            {name: 'j:permissionNames', type: 'STRING', values: permissions},
            {name: 'j:privilegedAccess', type: 'BOOLEAN', value: String(privilegedAccess)}
        ],
        children: children
    }, apolloOptions);
};

/**
 * Delete the role `name` from `/roles`.
 *
 * @param name name of the role
 * @param apolloOptions options forwarded to `cy.apollo`
 * @returns the `deleteNode` mutation result
 */
export const deleteRole = (name: string, apolloOptions: ApolloOptions = {}): Cypress.Chainable => {
    cy.log(`Delete role ${name}`);
    return deleteNode(`/roles/${name}`, 'EDIT', apolloOptions);
};
