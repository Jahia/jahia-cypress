export declare const publishAndWaitJobEnding: (path: string, languages?: string[]) => void;
export declare const unpublishNode: (path: string, languages: string) => void;
export declare const startWorkflow: (pathOrId: string, definition: string, language: string) => Cypress.Chainable;
export declare const validateAllWorkflows: () => void;
export declare const abortAllWorkflows: () => void;
export declare const waitAllJobsFinished: (errorMessage?: string, timeout?: number) => void;
