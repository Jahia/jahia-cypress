/*
    When Jahia is starting or performing provisioning operations
    it is expected for the SAM probe to alternate beween GREEN, YELLOW and RED statuses.

    The primary use of this method is to wait until a Jahia platform stabilizes after a startup or
    provisioning operation.

    Instead of waiting only for one occurence of a GREEN status, this function will wait until the a
    GREEN status was returned a number of consecutive times (greenMatchCount).
*/
export const waitUntilSAMStatusGreen = (severity = 'MEDIUM', timeout = 60000, interval = 500, greenMatchCount = 10) : void => {
    let greenCount = 0;
    cy.waitUntil(() =>
        cy.apollo({
            fetchPolicy: 'no-cache',
            queryFile: 'graphql/sam/healthStatus.graphql',
            variables: {
                severity: severity
            }
        }).then(result => {
            const healthStatus = result?.data?.admin?.jahia?.healthCheck?.status;
            if (healthStatus) {
                greenCount = healthStatus.health === 'GREEN' ? greenCount + 1 : 0;
                return greenCount >= greenMatchCount;
            }
        }),
    {
        errorMsg: `Timeout waiting for SAM to be green for severity: ${severity}`,
        timeout: timeout,
        verbose: true,
        interval: interval
    });
};

