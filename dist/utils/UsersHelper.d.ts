export declare const grantRoles: (pathOrId: string, roleNames: Array<string>, principalName: string, principalType: string) => Cypress.Chainable;
export declare const revokeRoles: (pathOrId: string, roleNames: Array<string>, principalName: string, principalType: string) => Cypress.Chainable;
export declare const createUser: (userName: string, password: string, properties?: {
    name: string;
    value: string;
}[]) => void;
export declare const deleteUser: (userName: string) => void;
export declare const addUserToGroup: (userName: string, groupName: string, siteKey?: string) => void;
