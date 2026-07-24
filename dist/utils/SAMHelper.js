"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitUntilSAMStatusGreen = exports.waitUntilSAMStatus = exports.healthCheck = void 0;
/**
 * Simple health check query
 * @param severity the severity of the health check, default is MEDIUM
 * @param probeHealthFilter return only probes with health status matching or above, default is null
 * @param probeNamesFilter return and calculate health status only for the probes with the given names, default is null
 */
var healthCheck = function (severity, probeHealthFilter, probeNamesFilter) {
    if (severity === void 0) { severity = 'MEDIUM'; }
    if (probeHealthFilter === void 0) { probeHealthFilter = null; }
    if (probeNamesFilter === void 0) { probeNamesFilter = null; }
    return cy
        .apollo({
        fetchPolicy: 'no-cache',
        queryFile: 'graphql/sam/healthStatus.graphql',
        variables: {
            severity: severity,
            probeHealthFilter: probeHealthFilter,
            probeNamesFilter: probeNamesFilter
        }
    })
        .then(function (response) {
        var _a, _b, _c;
        return (_c = (_b = (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.admin) === null || _b === void 0 ? void 0 : _b.jahia) === null || _c === void 0 ? void 0 : _c.healthCheck;
    });
};
exports.healthCheck = healthCheck;
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
var waitUntilSAMStatus = function (_a) {
    var expectedHealth = _a.expectedHealth, _b = _a.severity, severity = _b === void 0 ? 'MEDIUM' : _b, _c = _a.probeHealthFilter, probeHealthFilter = _c === void 0 ? null : _c, _d = _a.probeNamesFilter, probeNamesFilter = _d === void 0 ? null : _d, _e = _a.timeout, timeout = _e === void 0 ? 60000 : _e, _f = _a.interval, interval = _f === void 0 ? 500 : _f, _g = _a.statusMatchCount, statusMatchCount = _g === void 0 ? 3 : _g;
    var statusCount = 0;
    var lastGraphqlResponse = {};
    cy.waitUntil(function () {
        return (0, exports.healthCheck)(severity, probeHealthFilter, probeNamesFilter).then(function (result) {
            lastGraphqlResponse = result;
            var healthStatus = result === null || result === void 0 ? void 0 : result.status;
            if (healthStatus) {
                statusCount = healthStatus.health === expectedHealth ? statusCount + 1 : 0;
                return statusCount >= statusMatchCount;
            }
        });
    }, {
        errorMsg: function () {
            return "Timeout waiting for SAM to be ".concat(expectedHealth, " for severity: ").concat(severity, " and probeHealthFilter: ").concat(probeHealthFilter, ". Last GraphQL response: ").concat(JSON.stringify(lastGraphqlResponse));
        },
        timeout: timeout,
        verbose: true,
        interval: interval
    });
};
exports.waitUntilSAMStatus = waitUntilSAMStatus;
/**
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
    // We use YELLOW as the probeHealthFilter because we are not interested in potential GREEN probes in the response
    (0, exports.waitUntilSAMStatus)({ expectedHealth: 'GREEN', severity: severity, probeHealthFilter: 'YELLOW', timeout: timeout, interval: interval, statusMatchCount: greenMatchCount });
};
exports.waitUntilSAMStatusGreen = waitUntilSAMStatusGreen;
