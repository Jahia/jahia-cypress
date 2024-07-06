"use strict";
exports.__esModule = true;
exports.waitAllJobsFinished = exports.abortAllWorkflows = exports.validateAllWorkflows = exports.startWorkflow = exports.unpublishNode = exports.publishAndWaitJobEnding = void 0;
var publishAndWaitJobEnding = function (path, languages) {
    if (languages === void 0) { languages = ['en']; }
    cy.apollo({
        variables: {
            pathOrId: path,
            languages: languages,
            publishSubNodes: true,
            includeSubTree: true
        },
        mutationFile: 'graphql/jcr/mutation/publishNode.graphql'
    });
    exports.waitAllJobsFinished('Publication timeout for node: ' + path, 60000);
};
exports.publishAndWaitJobEnding = publishAndWaitJobEnding;
var unpublishNode = function (path, languages) {
    cy.apollo({
        variables: {
            pathOrId: path,
            languages: languages
        },
        mutationFile: 'graphql/jcr/mutation/unpublishNode.graphql'
    });
};
exports.unpublishNode = unpublishNode;
var startWorkflow = function (pathOrId, definition, language) {
    return cy.apollo({
        variables: {
            pathOrId: pathOrId,
            definition: definition,
            language: language
        },
        mutationFile: 'graphql/jcr/mutation/startWorkflow.graphql'
    });
};
exports.startWorkflow = startWorkflow;
var validateAllWorkflows = function () {
    cy.executeGroovy('groovy/admin/completeWorkflows.groovy');
    exports.waitAllJobsFinished('All workflows validated but some jobs are still running after a minute', 60000);
};
exports.validateAllWorkflows = validateAllWorkflows;
var abortAllWorkflows = function () {
    cy.executeGroovy('groovy/admin/abortWorkflows.groovy');
};
exports.abortAllWorkflows = abortAllWorkflows;
var waitAllJobsFinished = function (errorMessage, timeout) {
    if (timeout === void 0) { timeout = 60000; }
    cy.waitUntil(function () {
        return cy
            .apollo({
            fetchPolicy: 'no-cache',
            queryFile: 'graphql/jcr/query/getJobsWithStatus.graphql'
        })
            .then(function (response) {
            var _a, _b, _c, _d;
            var jobs = (_d = (_c = (_b = (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.admin) === null || _b === void 0 ? void 0 : _b.jahia) === null || _c === void 0 ? void 0 : _c.scheduler) === null || _d === void 0 ? void 0 : _d.jobs;
            var publicationJobs = jobs.filter(function (job) { return job.group === 'PublicationJob'; });
            var hasActivePublicationJobs = publicationJobs.some(function (job) { return job.jobStatus === 'EXECUTING'; });
            return !hasActivePublicationJobs;
        });
    }, {
        errorMsg: errorMessage ? errorMessage : 'Jobs are still running before the end of timeout',
        timeout: timeout,
        verbose: true,
        interval: 500
    });
    // Wait 0.5 seconds for server sync after publication
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
};
exports.waitAllJobsFinished = waitAllJobsFinished;
