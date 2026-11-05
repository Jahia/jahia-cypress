
export const publishAndWaitJobEnding = (path: string, languages: string[] = ['en']): void => {
    cy.apollo({
        variables: {
            pathOrId: path,
            languages: languages,
            publishSubNodes: true,
            includeSubTree: true
        },
        mutationFile: 'graphql/jcr/mutation/publishNode.graphql'
    });
    waitAllJobsFinished('Publication timeout for node: ' + path, 60000, path);
};

export const unpublishNode = (path: string, languages: string): void => {
    cy.apollo({
        variables: {
            pathOrId: path,
            languages: languages
        },
        mutationFile: 'graphql/jcr/mutation/unpublishNode.graphql'
    });
};

export const startWorkflow = (pathOrId: string, definition: string, language: string): Cypress.Chainable => {
    return cy.apollo({
        variables: {
            pathOrId,
            definition,
            language
        },
        mutationFile: 'graphql/jcr/mutation/startWorkflow.graphql'
    });
};

export const validateAllWorkflows = (): void => {
    cy.executeGroovy('groovy/admin/completeWorkflows.groovy');
    waitAllJobsFinished('All workflows validated but some jobs are still running after a minute', 60000);
};

export const abortAllWorkflows = (): void => {
    cy.executeGroovy('groovy/admin/abortWorkflows.groovy');
};

// The jobStringListProperty field comes with graphql-core 3.2.0; an older Jahia gets the global wait.
let publicationPathsSupported: boolean | undefined;

const supportsPublicationPaths = (): Cypress.Chainable<boolean> => {
    if (publicationPathsSupported !== undefined) {
        return cy.wrap(publicationPathsSupported, {log: false});
    }

    return cy.apollo({
        variables: {typeName: 'GqlBackgroundJob'},
        queryFile: 'graphql/introspection.graphql'
    }).then(response => {
        publicationPathsSupported = Boolean(response?.data?.__type?.fields?.some(field => field.name === 'jobStringListProperty'));
        return publicationPathsSupported;
    });
};

/** True when nodePath is rootPath itself or a node below it. */
const isInSubtree = (nodePath: string, rootPath: string): boolean => {
    const prefix = rootPath.endsWith('/') ? rootPath : rootPath + '/';
    return nodePath === rootPath || nodePath.startsWith(prefix);
};

// Jahia runs one publication at a time, so the job of a path can wait as ADDED or SCHEDULED behind another one.
const PENDING_STATUSES = ['ADDED', 'SCHEDULED', 'EXECUTING'];

/**
 * True when the job is a publication still to finish. Given a path, a queued job of that node or a node under it
 * counts too; without one, only an executing job counts, as before.
 */
const isRunningPublication = (job, path?: string): boolean =>
    job.group === 'PublicationJob' && (path ?
        PENDING_STATUSES.includes(job.jobStatus) && (job.publicationPaths ?? []).some(nodePath => isInSubtree(nodePath, path)) :
        job.jobStatus === 'EXECUTING');

/**
 * Waits until no PublicationJob is executing. With a JCR path, waits only for the jobs that publish
 * that node or a node under it, so specs running side by side do not wait for each other.
 * An identifier instead of a path, or a Jahia without publicationPaths, waits for every job, as before.
 */
export const waitAllJobsFinished = (errorMessage?: string, timeout?: number, path?: string): void => {
    const scoped = path?.startsWith('/') ? supportsPublicationPaths() : cy.wrap(false, {log: false});
    scoped.then(byPath => {
        cy.waitUntil(
            () =>
                cy
                    .apollo({
                        fetchPolicy: 'no-cache',
                        queryFile: byPath ? 'graphql/jcr/query/getPublicationJobsWithPaths.graphql' : 'graphql/jcr/query/getJobsWithStatus.graphql'
                    })
                    .then(response => {
                        const jobs = response?.data?.admin?.jahia?.scheduler?.jobs ?? [];
                        return !jobs.some(job => isRunningPublication(job, byPath ? path : undefined));
                    }),
            {
                errorMsg: errorMessage ? errorMessage : 'Jobs are still running before the end of timeout',
                timeout: timeout ?? 60000,
                verbose: true,
                interval: 500
            }
        );
    });
    // Wait 0.5 seconds for server sync after publication
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
};
