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
Object.defineProperty(exports, "__esModule", { value: true });
exports.apollo = void 0;
var graphql_tag_1 = __importDefault(require("graphql-tag"));
var graphql_1 = require("graphql");
function isQuery(options) {
    return options.query !== undefined;
}
function isQueryFile(options) {
    return options.queryFile !== undefined;
}
function isMutationFile(options) {
    return options.mutationFile !== undefined;
}
function getOperationLabel(doc, opType) {
    var _a, _b, _c, _d, _e;
    var opDef = (0, graphql_1.getOperationAST)(doc);
    if ((_a = opDef === null || opDef === void 0 ? void 0 : opDef.name) === null || _a === void 0 ? void 0 : _a.value) {
        return "[".concat(opType, "] ").concat(opDef.name.value);
    }
    // Anonymous operation: traverse up to 2 selection levels for a meaningful label
    var firstSel = (_c = (_b = opDef === null || opDef === void 0 ? void 0 : opDef.selectionSet) === null || _b === void 0 ? void 0 : _b.selections) === null || _c === void 0 ? void 0 : _c[0];
    if ((firstSel === null || firstSel === void 0 ? void 0 : firstSel.kind) === 'Field') {
        var firstName = firstSel.name.value;
        var secondSel = (_e = (_d = firstSel.selectionSet) === null || _d === void 0 ? void 0 : _d.selections) === null || _e === void 0 ? void 0 : _e[0];
        if ((secondSel === null || secondSel === void 0 ? void 0 : secondSel.kind) === 'Field') {
            return "[".concat(opType, "] ").concat(firstName, " \u203A ").concat(secondSel.name.value);
        }
        return "[".concat(opType, "] ").concat(firstName);
    }
    return "[".concat(opType, "]");
}
function getQueryBody(doc) {
    var _a, _b, _c;
    return (_c = (_b = (_a = doc === null || doc === void 0 ? void 0 : doc.loc) === null || _a === void 0 ? void 0 : _a.source) === null || _b === void 0 ? void 0 : _b.body) !== null && _c !== void 0 ? _c : (0, graphql_1.print)(doc);
}
// eslint-disable-next-line default-param-last, @typescript-eslint/no-shadow
var apollo = function (apollo, options) {
    if (apollo === void 0) { apollo = this.currentApolloClient; }
    var result;
    var logger;
    var duration;
    var optionsWithDefaultCache = __assign({ fetchPolicy: 'no-cache' }, options);
    if (!apollo) {
        cy.apolloClient().apollo(optionsWithDefaultCache);
    }
    else if (isQueryFile(optionsWithDefaultCache)) {
        var _a = optionsWithDefaultCache, queryFile_1 = _a.queryFile, sourcePackage_1 = _a.sourcePackage, apolloOptions_1 = __rest(_a, ["queryFile", "sourcePackage"]);
        cy.fixture(queryFile_1).then(function (content) {
            var fileLabel = sourcePackage_1 ? "".concat(queryFile_1, " @ ").concat(sourcePackage_1) : queryFile_1;
            cy.apollo(__assign(__assign({ query: (0, graphql_tag_1.default)(content) }, apolloOptions_1), { _sourceFile: fileLabel }));
        });
    }
    else if (isMutationFile(optionsWithDefaultCache)) {
        var _b = optionsWithDefaultCache, mutationFile_1 = _b.mutationFile, sourcePackage_2 = _b.sourcePackage, apolloOptions_2 = __rest(_b, ["mutationFile", "sourcePackage"]);
        cy.fixture(mutationFile_1).then(function (content) {
            var fileLabel = sourcePackage_2 ? "".concat(mutationFile_1, " @ ").concat(sourcePackage_2) : mutationFile_1;
            cy.apollo(__assign(__assign({ mutation: (0, graphql_tag_1.default)(content) }, apolloOptions_2), { _sourceFile: fileLabel }));
        });
    }
    else {
        var _c = optionsWithDefaultCache.log, log = _c === void 0 ? true : _c, apolloOptions = __rest(optionsWithDefaultCache, ["log"]);
        var doc = isQuery(apolloOptions) ?
            apolloOptions.query :
            apolloOptions.mutation;
        var opType_1 = isQuery(apolloOptions) ? 'Query' : 'Mutation';
        var operationLabel_1 = getOperationLabel(doc, opType_1);
        var queryBody_1 = getQueryBody(doc);
        var variables_1 = apolloOptions.variables;
        var sourceLabel_1 = optionsWithDefaultCache._sourceFile ? " (".concat(optionsWithDefaultCache._sourceFile, ")") : '';
        var variablesLabel_1 = variables_1 && Object.keys(variables_1).length > 0 ?
            " \u2014 ".concat(JSON.stringify(variables_1)) :
            '';
        if (log) {
            logger = Cypress.log({
                autoEnd: false,
                name: 'apollo',
                displayName: 'apollo',
                message: "".concat(operationLabel_1).concat(sourceLabel_1).concat(variablesLabel_1),
                consoleProps: function () {
                    var _a;
                    var _b, _c, _d;
                    var errors = (_c = (_b = result === null || result === void 0 ? void 0 : result.errors) !== null && _b !== void 0 ? _b : result === null || result === void 0 ? void 0 : result.graphQLErrors) !== null && _c !== void 0 ? _c : null;
                    var isCaughtError = result instanceof Error;
                    var hasErrors = ((errors === null || errors === void 0 ? void 0 : errors.length) > 0) || isCaughtError;
                    return _a = {
                            Operation: operationLabel_1,
                            Variables: variables_1 !== null && variables_1 !== void 0 ? variables_1 : {}
                        },
                        _a["".concat(opType_1, " Body")] = queryBody_1,
                        _a.Duration = duration === undefined ? 'pending' : "".concat(duration, "ms"),
                        _a.Status = hasErrors ?
                            "error".concat(isCaughtError ? ": ".concat(result.message) : '') :
                            'success',
                        _a.Data = (_d = result === null || result === void 0 ? void 0 : result.data) !== null && _d !== void 0 ? _d : null,
                        _a.Errors = errors,
                        _a.Yielded = result,
                        _a;
                }
            });
        }
        var startTime_1 = Date.now();
        cy.wrap({}, { log: false })
            .then(function () { return (isQuery(optionsWithDefaultCache) ? apollo.query(optionsWithDefaultCache).catch(function (error) {
            var _a;
            cy.log("Caught GraphQL query error: ".concat((_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : JSON.stringify(error)));
            return error;
        }) : apollo.mutate(optionsWithDefaultCache).catch(function (error) {
            var _a;
            cy.log("Caught GraphQL mutation error: ".concat((_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : JSON.stringify(error)));
            return error;
        }))
            .then(function (r) {
            var _a;
            result = r;
            duration = Date.now() - startTime_1;
            if (logger) {
                var errors = (_a = r === null || r === void 0 ? void 0 : r.errors) !== null && _a !== void 0 ? _a : r === null || r === void 0 ? void 0 : r.graphQLErrors;
                var hasErrors = (r instanceof Error) || ((errors === null || errors === void 0 ? void 0 : errors.length) > 0);
                var prefix = hasErrors ? '❌ ' : '✅ ';
                logger.set('message', "".concat(prefix).concat(operationLabel_1).concat(sourceLabel_1).concat(variablesLabel_1));
            }
            logger === null || logger === void 0 ? void 0 : logger.end();
            return r;
        }); });
    }
};
exports.apollo = apollo;
