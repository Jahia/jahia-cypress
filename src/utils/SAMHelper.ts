/* eslint-disable @typescript-eslint/no-explicit-any */
import Chainable = Cypress.Chainable

/**
 * Simple health check query
 * @param severity the severity of the health check, default is MEDIUM
 * @param probeHealthFilter return only probes with health status matching or above, default is null
 * @param probeNamesFilter return and calculate health status only for the probes with the given names, default is null
 */
export const healthCheck = (severity = 'MEDIUM', probeHealthFilter = null, probeNamesFilter: string[] = null): Chainable<any> => {
    return cy
        .apollo({
            fetchPolicy: 'no-cache',
            queryFile: 'graphql/sam/healthStatus.graphql',
            variables: {
                severity,
                probeHealthFilter,
                probeNamesFilter
            }
        })
        .then((response: any) => {
            return response?.data?.admin?.jahia?.healthCheck;
        });
};

type WaitUntilSAMStatusParams = {
    expectedHealth: string;
    severity?: string;
    probeHealthFilter?: any;
    probeNamesFilter?: string[] | null;
    timeout?: number;
    interval?: number;
    statusMatchCount?: number;
};

/**
 * Wait until the health check returns the expected health
 * @param expectedHealth the expected health status
 * @param severity the severity of the health check, default is MEDIUM
 * @param probeHealthFilter return only probes with health status matching or above, default is null
 * @param probeNamesFilter return and calculate health status only for the probes with the given names, default is null
 * @param timeout the timeout in milliseconds, default is 60000
 * @param interval the interval in milliseconds, default is 500
 * @param statusMatchCount the number of consecutive status matches before the waitUntil resolves, default is 3
 */
export const waitUntilSAMStatus = ({expectedHealth, severity = 'MEDIUM', probeHealthFilter = null, probeNamesFilter = null, timeout = 60000, interval = 500, statusMatchCount = 3}: WaitUntilSAMStatusParams) : void => {
    let statusCount = 0;
    let lastGraphqlResponse = {};
    cy.waitUntil(() =>
        healthCheck(severity, probeHealthFilter, probeNamesFilter).then(result => {
            lastGraphqlResponse = result;
            const healthStatus = result?.status;
            if (healthStatus) {
                statusCount = healthStatus.health === expectedHealth ? statusCount + 1 : 0;
                return statusCount >= statusMatchCount;
            }
        }),
    {
        errorMsg: () => {
            return `Timeout waiting for SAM to be ${expectedHealth} for severity: ${severity} and probeHealthFilter: ${probeHealthFilter}. Last GraphQL response: ${JSON.stringify(lastGraphqlResponse)}`;
        },
        timeout: timeout,
        verbose: true,
        interval: interval
    });
};

/**
 When Jahia is starting or performing provisioning operations
 it is expected for the SAM probe to alternate beween GREEN, YELLOW and RED statuses.

 The primary use of this method is to wait until a Jahia platform stabilizes after a startup or
 provisioning operation.

 Instead of waiting only for one occurence of a GREEN status, this function will wait until the a
 GREEN status was returned a number of consecutive times (greenMatchCount).
 */
export const waitUntilSAMStatusGreen = (severity = 'MEDIUM', timeout = 60000, interval = 500, greenMatchCount = 10) : void => {
    // We use YELLOW as the probeHealthFilter because we are not interested in potential GREEN probes in the response
    waitUntilSAMStatus({expectedHealth: 'GREEN', severity, probeHealthFilter: 'YELLOW', timeout, interval, statusMatchCount: greenMatchCount});
};

