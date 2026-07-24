import Chainable = Cypress.Chainable;
/**
 * Simple health check query
 * @param severity the severity of the health check, default is MEDIUM
 * @param probeHealthFilter return only probes with health status matching or above, default is null
 * @param probeNamesFilter return and calculate health status only for the probes with the given names, default is null
 */
export declare const healthCheck: (severity?: string, probeHealthFilter?: any, probeNamesFilter?: string[]) => Chainable<any>;
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
export declare const waitUntilSAMStatus: ({ expectedHealth, severity, probeHealthFilter, probeNamesFilter, timeout, interval, statusMatchCount }: WaitUntilSAMStatusParams) => void;
/**
 When Jahia is starting or performing provisioning operations
 it is expected for the SAM probe to alternate beween GREEN, YELLOW and RED statuses.

 The primary use of this method is to wait until a Jahia platform stabilizes after a startup or
 provisioning operation.

 Instead of waiting only for one occurence of a GREEN status, this function will wait until the a
 GREEN status was returned a number of consecutive times (greenMatchCount).
 */
export declare const waitUntilSAMStatusGreen: (severity?: string, timeout?: number, interval?: number, greenMatchCount?: number) => void;
export {};
