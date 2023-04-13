
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
    waitAllJobsFinished('Publication timeout for node: ' + path, 60000);
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

export const waitAllJobsFinished = (errorMessage?: string, timeout = 60000, test): void => {
    cy.waitUntil(
        () =>
            cy
                .apollo({
                    fetchPolicy: 'no-cache',
                    queryFile: 'graphql/jcr/query/getJobsWithStatus.graphql'
                })
                .then(response => {
                    const jobs = response?.data?.admin?.jahia?.scheduler?.jobs;
                    const publicationJobs = jobs.filter(job => job.group === 'PublicationJob');
                    const hasActivePublicationJobs = publicationJobs.some(job => job.jobStatus === 'EXECUTING');
                    return !hasActivePublicationJobs;
                }),
        {
            errorMsg: errorMessage ? errorMessage : 'Jobs are still running before the end of timeout',
            timeout: timeout,
            verbose: true,
            interval: 500
        }
    );
    // Wait 0.5 seconds for server sync after publication
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
};
