"use strict";
// Utility methods to call import/export Jahia API
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportContent = void 0;
var API_NAME = '/cms/export';
var serverDefaults = {
    url: Cypress.config().baseUrl,
    username: 'root',
    password: Cypress.env('SUPER_USER_PASSWORD')
};
var exportContent = function (_a) {
    var _b, _c;
    var _d = _a.workspace, workspace = _d === void 0 ? 'default' : _d, _e = _a.nodePath, nodePath = _e === void 0 ? '/export' : _e, _f = _a.exportFormat, exportFormat = _f === void 0 ? 'zip' : _f, _g = _a.params, params = _g === void 0 ? {
        exportformat: 'site',
        live: true,
        users: true
    } : _g, _h = _a.jahiaServer, jahiaServer = _h === void 0 ? serverDefaults : _h;
    var queryStringParams = Object.keys(params)
        .filter(function (key) { return !['paths', 'sitebox'].includes(key); })
        .map(function (key) { return "".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(params[key])); }) || [];
    var sitebox = ((_b = params.sitebox) === null || _b === void 0 ? void 0 : _b.map(function (sb) { return "sitebox=".concat(encodeURIComponent(sb)); })) || [];
    var paths = ((_c = params.paths) === null || _c === void 0 ? void 0 : _c.map(function (path) { return "path=".concat(encodeURIComponent(path)); })) || [];
    var qs = __spreadArray(__spreadArray(__spreadArray([], queryStringParams, true), sitebox, true), paths, true).join('&');
    // It is not possible to use the "qs" field of RequestOptions for querystring as it does not support multiple parameters with the same name (path or sitebox)
    cy.request({
        url: "".concat(jahiaServer.url).concat(API_NAME, "/").concat(workspace).concat(nodePath, ".").concat(exportFormat, "?").concat(qs),
        method: 'GET',
        auth: {
            user: jahiaServer.username,
            pass: jahiaServer.password,
            sendImmediately: true
        }
    });
};
exports.exportContent = exportContent;
