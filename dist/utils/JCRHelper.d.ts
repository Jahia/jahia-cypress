declare type Workspace = 'EDIT' | 'LIVE';
export declare const setNodeProperty: (pathOrId: string, property: string, value: string | Array<string>, language: string) => Cypress.Chainable;
export declare const deleteNode: (pathOrId: string, workspace?: Workspace) => Cypress.Chainable;
export declare const deleteNodeProperty: (pathOrId: string, property: string, language: string) => Cypress.Chainable;
export declare const addNode: (variables: {
    parentPathOrId: string;
    primaryNodeType: string;
    name: string;
    properties?: any[];
    children?: any[];
    mixins?: any[];
}) => Cypress.Chainable;
export declare const getNodeByPath: (path: string, properties?: string[], language?: string, childrenTypes?: string[], workspace?: Workspace) => Cypress.Chainable;
export declare const getNodeAcl: (path: string) => Cypress.Chainable;
export declare const moveNode: (pathOrId: string, destParentPathOrId: string, destName?: string) => Cypress.Chainable;
export declare const getNodeTypes: (filter?: {}) => Cypress.Chainable;
export {};
