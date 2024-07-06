"use strict";
exports.__esModule = true;
exports.waitUntilJournalSync = void 0;
var waitUntilJournalSync = function (predicate, timeout, interval) {
    if (timeout === void 0) { timeout = 60000; }
    if (interval === void 0) { interval = 1000; }
    cy.waitUntil(function () {
        return cy.apollo({
            fetchPolicy: 'no-cache',
            queryFile: 'graphql/jcr/query/adminCluster.graphql'
        }).then(function (result) {
            var _a;
            var adminResult = (_a = result === null || result === void 0 ? void 0 : result.data) === null || _a === void 0 ? void 0 : _a.admin;
            if (adminResult) {
                return adminResult.cluster.isActivated &&
                    adminResult.cluster.journal.isClusterSync &&
                    (!predicate || predicate(adminResult.cluster));
            }
        });
    }, {
        errorMsg: 'Timeout waiting for journal to be synced',
        timeout: timeout,
        verbose: true,
        interval: interval
    });
};
exports.waitUntilJournalSync = waitUntilJournalSync;
