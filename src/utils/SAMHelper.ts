export const waitUntilSAMStatusGreen = (severity = 'MEDIUM', timeout = 60000, interval = 1000) : void => {
    cy.waitUntil(() =>
        cy.apollo({
            fetchPolicy: 'no-cache',
            queryFile: 'graphql/sam/healthStatus.graphql',
            variables: {
                severity: severity
            },            
        }).then(result => {
            const healthStatus = result?.data?.admin?.jahia?.healthCheck?.status;
            if (healthStatus) {
                return healthStatus.health === 'GREEN';
            }
        }),
    {
        errorMsg: `Timeout waiting for SAM to be green for severity: ${severity}`,
        timeout: timeout,
        verbose: true,
        interval: interval
    });
};

