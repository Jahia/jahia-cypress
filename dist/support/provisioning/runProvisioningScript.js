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
Object.defineProperty(exports, "__esModule", { value: true });
exports.runProvisioningScript = void 0;
function processContent(formFile) {
    var content = formFile.fileContent;
    if (formFile.replacements) {
        Object.keys(formFile.replacements).forEach(function (k) {
            content = content.replaceAll(k, formFile.replacements[k]);
        });
    }
    formFile.fileContent = content;
    // If the file has an encoding, create a Blob with the new Blob constructor. It handle correctly the encoding
    // for the groovy scripts
    // Did not change for all files because jar files can be added as well, which are binary files
    // In that case the function binaryStringToBlob will be used
    if (formFile.encoding) {
        return new Blob([content], { type: formFile.type });
    }
    // Default to binary string to blob conversion
    return Cypress.Blob.binaryStringToBlob(content, formFile.type);
}
function append(formFile, formData, key) {
    if (formFile.fileContent) {
        formData.append(key, processContent(formFile), formFile.fileName);
    }
    else if (formFile.fileName) {
        cy.fixture(formFile.fileName, (formFile.encoding ? formFile.encoding : 'binary')).then(function (content) {
            if (typeof content === 'object') {
                formFile.fileContent = JSON.stringify(content);
            }
            else {
                formFile.fileContent = content;
            }
            formData.append(key, processContent(formFile), formFile.fileName);
        });
    }
}
var serverDefaults = {
    url: Cypress.config().baseUrl,
    username: 'root',
    password: Cypress.env('SUPER_USER_PASSWORD')
};
function isFormFile(script) {
    return Boolean((script === null || script === void 0 ? void 0 : script.fileContent) || (script === null || script === void 0 ? void 0 : script.fileName));
}
function getScriptSummary(script) {
    if (isFormFile(script)) {
        if (script.fileName) {
            return script.fileName;
        }
        if (script.fileContent) {
            // Parse first operation and its value from YAML list: "- operationName: value"
            var yamlMatch = script.fileContent.match(/^\s*-\s+(\w+)\s*:\s*"?([^"\n]+)"?/m);
            if (yamlMatch) {
                return "".concat(yamlMatch[1], ": ").concat(yamlMatch[2].trim());
            }
            // Parse first operation name from JSON array: [{"operationName": ...}]
            try {
                var parsed = JSON.parse(script.fileContent);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    var ops_1 = parsed.map(function (op) { var _a; return (_a = Object.keys(op)[0]) !== null && _a !== void 0 ? _a : 'unknown'; });
                    return ops_1.length === 1 ? ops_1[0] : "[".concat(ops_1.join(', '), "]");
                }
            }
            catch (_a) {
                // Not valid JSON, fall through
            }
        }
        return 'inline script';
    }
    if (!script || script.length === 0) {
        return 'empty script';
    }
    var ops = script.map(function (op) { var _a; return (_a = Object.keys(op)[0]) !== null && _a !== void 0 ? _a : 'unknown'; });
    return ops.length === 1 ? ops[0] : "[".concat(ops.join(', '), "]");
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var runProvisioningScript = function (paramsOrScript) {
    var _a, _b, _c, _d, _e;
    var rest = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        rest[_i - 1] = arguments[_i];
    }
    // Backward-compatible: support old positional signature
    // runProvisioningScript(script, files, jahiaServer, options, timeout)
    var script;
    var files;
    var jahiaServer;
    var options;
    var requestOptions;
    var isLegacyCall = Array.isArray(paramsOrScript) ||
        paramsOrScript.fileContent !== undefined ||
        paramsOrScript.fileName !== undefined;
    if (isLegacyCall) {
        script = paramsOrScript;
        files = rest[0];
        jahiaServer = (_a = rest[1]) !== null && _a !== void 0 ? _a : serverDefaults;
        options = (_b = rest[2]) !== null && _b !== void 0 ? _b : { log: true };
        requestOptions = {};
    }
    else {
        var params = paramsOrScript;
        script = params.script;
        files = params.files;
        jahiaServer = (_c = params.jahiaServer) !== null && _c !== void 0 ? _c : serverDefaults;
        options = (_d = params.options) !== null && _d !== void 0 ? _d : { log: true };
        requestOptions = (_e = params.requestOptions) !== null && _e !== void 0 ? _e : {};
    }
    var formData = new FormData();
    if (isFormFile(script)) {
        append(script, formData, 'script');
    }
    else {
        append({
            fileContent: JSON.stringify(script),
            type: 'application/json'
        }, formData, 'script');
    }
    if (files) {
        files.forEach(function (f) {
            append(f, formData, 'file');
        });
    }
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    var response;
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    var result;
    var logger;
    var scriptSummary = getScriptSummary(script);
    var replacementsFromFiles = files === null || files === void 0 ? void 0 : files.filter(function (f) { return f.replacements && Object.keys(f.replacements).length > 0; }).map(function (f) { return "".concat(f.fileName, ": ").concat(JSON.stringify(f.replacements)); });
    if (options.log) {
        logger = Cypress.log({
            autoEnd: false,
            name: 'runProvisioningScript',
            displayName: 'provScript',
            message: "".concat(scriptSummary, " @ ").concat(jahiaServer.url),
            consoleProps: function () {
                var _a;
                return {
                    Script: script,
                    Operations: isFormFile(script) ?
                        undefined :
                        script === null || script === void 0 ? void 0 : script.map(function (op) { return "".concat(Object.keys(op)[0], ": ").concat(Object.values(op)[0]); }),
                    Files: (_a = files === null || files === void 0 ? void 0 : files.map(function (f) { var _a; return (_a = f.fileName) !== null && _a !== void 0 ? _a : 'inline file'; })) !== null && _a !== void 0 ? _a : [],
                    Replacements: (replacementsFromFiles === null || replacementsFromFiles === void 0 ? void 0 : replacementsFromFiles.length) > 0 ? replacementsFromFiles : undefined,
                    Server: jahiaServer.url,
                    'HTTP Status': response ? "".concat(response.status, " ").concat(response.statusText) : 'pending',
                    Duration: response ? "".concat(response.duration, "ms") : 'pending',
                    Result: result,
                    Response: response
                };
            }
        });
    }
    var request = __assign({ url: "".concat(jahiaServer.url, "/modules/api/provisioning"), method: 'POST', auth: {
            user: jahiaServer.username,
            pass: jahiaServer.password,
            sendImmediately: true
        }, body: formData, log: false }, requestOptions);
    cy.request(request).then(function (res) {
        response = res;
        // If the response status is 200, decode the response, otherwise return the response as is
        if (res.status === 200) {
            try {
                var decoder = new TextDecoder();
                result = JSON.parse(decoder.decode(response.body));
            }
            catch (e) {
                result = e;
            }
        }
        else {
            result = res;
        }
        logger === null || logger === void 0 ? void 0 : logger.end();
        if (logger) {
            var hasFailed = res.status !== 200 ||
                (Array.isArray(result) && result.some(function (r) { return typeof r === 'string' && r.includes('.failed'); })); // eslint-disable-line @typescript-eslint/no-explicit-any
            var prefix = hasFailed ? '❌ ' : '✅ ';
            logger.set('message', "".concat(prefix).concat(scriptSummary, " @ ").concat(jahiaServer.url));
        }
        return result;
    });
};
exports.runProvisioningScript = runProvisioningScript;
