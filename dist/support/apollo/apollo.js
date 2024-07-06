"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.apollo = void 0;
var graphql_tag_1 = __importDefault(require("graphql-tag"));
function isQuery(options) {
    return options.query !== undefined;
}
function isQueryFile(options) {
    return options.queryFile !== undefined;
}
function isMutationFile(options) {
    return options.mutationFile !== undefined;
}
// eslint-disable-next-line default-param-last, @typescript-eslint/no-shadow
var apollo = function (apollo, options) {
    if (apollo === void 0) { apollo = this.currentApolloClient; }
    var result;
    var logger;
    var optionsWithDefaultCache = __assign({ fetchPolicy: 'no-cache' }, options);
    if (!apollo) {
        cy.apolloClient().apollo(optionsWithDefaultCache);
    }
    else if (isQueryFile(optionsWithDefaultCache)) {
        var queryFile = optionsWithDefaultCache.queryFile, apolloOptions_1 = __rest(optionsWithDefaultCache, ["queryFile"]);
        cy.fixture(queryFile).then(function (content) {
            cy.apollo(__assign({ query: graphql_tag_1["default"](content) }, apolloOptions_1));
        });
    }
    else if (isMutationFile(optionsWithDefaultCache)) {
        var mutationFile = optionsWithDefaultCache.mutationFile, apolloOptions_2 = __rest(optionsWithDefaultCache, ["mutationFile"]);
        cy.fixture(mutationFile).then(function (content) {
            cy.apollo(__assign({ mutation: graphql_tag_1["default"](content) }, apolloOptions_2));
        });
    }
    else {
        var _a = optionsWithDefaultCache.log, log = _a === void 0 ? true : _a, apolloOptions_3 = __rest(optionsWithDefaultCache, ["log"]);
        if (log) {
            logger = Cypress.log({
                autoEnd: false,
                name: 'apollo',
                displayName: 'apollo',
                message: isQuery(apolloOptions_3) ? "Execute Graphql Query: " + apolloOptions_3.query.loc.source.body : "Execute Graphql Mutation: " + apolloOptions_3.mutation.loc.source.body,
                consoleProps: function () {
                    return {
                        Options: apolloOptions_3,
                        Yielded: result
                    };
                }
            });
        }
        cy.wrap({}, { log: true })
            .then(function () { return (isQuery(optionsWithDefaultCache) ? apollo.query(optionsWithDefaultCache)["catch"](function (error) {
            cy.log("Caught Graphql Query Error: " + JSON.stringify(error));
            return error;
        }) : apollo.mutate(optionsWithDefaultCache)["catch"](function (error) {
            cy.log("Caught Graphql Mutation Error: " + JSON.stringify(error));
            return error;
        }))
            .then(function (r) {
            result = r;
            logger === null || logger === void 0 ? void 0 : logger.end();
            return r;
        }); });
    }
};
exports.apollo = apollo;
