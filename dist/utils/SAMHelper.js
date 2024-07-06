"use strict";
exports.__esModule = true;
exports.waitUntilSAMStatusGreen = void 0;
/*
    When Jahia is starting or performing provisioning operations
    it is expected for the SAM probe to alternate beween GREEN, YELLOW and RED statuses.

    The primary use of this method is to wait until a Jahia platform stabilizes after a startup or
    provisioning operation.

    Instead of waiting only for one occurence of a GREEN status, this function will wait until the a
    GREEN status was returned a number of consecutive times (greenMatchCount).
*/
var waitUntilSAMStatusGreen = function (severity, timeout, interval, greenMatchCount) {
    if (severity === void 0) { severity = 'MEDIUM'; }
    if (timeout === void 0) { timeout = 60000; }
    if (interval === void 0) { interval = 500; }
    if (greenMatchCount === void 0) { greenMatchCount = 10; }
    var greenCount = 0;
    cy.waitUntil(function () {
        return cy.apollo({
            fetchPolicy: 'no-cache',
            queryFile: 'graphql/sam/healthStatus.graphql',
            variables: {
                severity: severity
            }
        }).then(function (result) {
            var _a, _b, _c, _d;
            var healthStatus = (_d = (_c = (_b = (_a = result === null || result === void 0 ? void 0 : result.data) === null || _a === void 0 ? void 0 : _a.admin) === null || _b === void 0 ? void 0 : _b.jahia) === null || _c === void 0 ? void 0 : _c.healthCheck) === null || _d === void 0 ? void 0 : _d.status;
            if (healthStatus) {
                greenCount = healthStatus.health === 'GREEN' ? greenCount + 1 : 0;
                return greenCount >= greenMatchCount;
            }
        });
    }, {
        errorMsg: "Timeout waiting for SAM to be green for severity: " + severity,
        timeout: timeout,
        verbose: true,
        interval: interval
    });
};
exports.waitUntilSAMStatusGreen = waitUntilSAMStatusGreen;
