"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.uploadLink = exports.formDataHttpLink = void 0;
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
var http_1 = require("@apollo/client/link/http");
var cross_fetch_1 = __importDefault(require("cross-fetch"));
var context_1 = require("@apollo/client/link/context");
var formDataHttpLink = function (baseUrl, headers) {
    return new http_1.HttpLink({
        uri: baseUrl + "/modules/graphql",
        headers: headers,
        fetch: function (uri, fetcherOptions) {
            var options = __assign({}, fetcherOptions);
            if (options.formData) {
                var formData_1 = options.formData;
                var body_1 = JSON.parse(options.body.toString());
                if (Array.isArray(body_1)) {
                    formData_1.append('query', options.body.toString());
                }
                else {
                    Object.keys(body_1).forEach(function (k) {
                        return formData_1.append(k, typeof body_1[k] === 'string' ? body_1[k] : JSON.stringify(body_1[k]));
                    });
                }
                fetcherOptions.body = formData_1;
                delete fetcherOptions.headers['content-type'];
                return cross_fetch_1["default"](uri, fetcherOptions);
            }
            return cross_fetch_1["default"](uri, fetcherOptions);
        }
    });
};
exports.formDataHttpLink = formDataHttpLink;
exports.uploadLink = context_1.setContext(function (operation, _a) {
    var fetchOptions = _a.fetchOptions;
    var variables = operation.variables;
    var fileFound = false;
    var formData = new FormData();
    var id = Math.random().toString(36);
    // Search for File objects on the request and set it as formData
    Object.keys(variables).forEach(function (k) {
        var variable = variables[k];
        if (variable instanceof File) {
            formData.append(id, variable);
            variables[k] = id;
            fileFound = true;
        }
    });
    if (fileFound) {
        return {
            fetchOptions: __assign(__assign({}, fetchOptions), { formData: formData })
        };
    }
    return {
        fetchOptions: __assign({}, fetchOptions)
    };
});
