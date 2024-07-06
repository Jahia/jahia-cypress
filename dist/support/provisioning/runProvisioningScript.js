"use strict";
exports.__esModule = true;
exports.runProvisioningScript = void 0;
function processContent(formFile) {
    var content = formFile.fileContent;
    if (formFile.replacements) {
        Object.keys(formFile.replacements).forEach(function (k) {
            content = content.replaceAll(k, formFile.replacements[k]);
        });
    }
    formFile.fileContent = content;
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
    return Boolean(script.fileContent || script.fileName);
}
// eslint-disable-next-line default-param-last, max-params
var runProvisioningScript = function (script, files, jahiaServer, options, timeout) {
    if (jahiaServer === void 0) { jahiaServer = serverDefaults; }
    if (options === void 0) { options = { log: true }; }
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
    if (options.log) {
        logger = Cypress.log({
            autoEnd: false,
            name: 'runProvisioningScript',
            displayName: 'provScript',
            message: "Run " + (isFormFile(script) && script.fileName ? script.fileName : 'inline script') + " towards server: " + jahiaServer.url,
            consoleProps: function () {
                return {
                    Script: script,
                    Files: files,
                    Response: response,
                    Yielded: result
                };
            }
        });
    }
    var request = {
        url: jahiaServer.url + "/modules/api/provisioning",
        method: 'POST',
        auth: {
            user: jahiaServer.username,
            pass: jahiaServer.password,
            sendImmediately: true
        },
        body: formData,
        log: false
    };
    if (typeof timeout !== 'undefined') {
        request.timeout = timeout;
    }
    cy.request(request).then(function (res) {
        response = res;
        expect(res.status, 'Script result').to.eq(200);
        try {
            var decoder = new TextDecoder();
            result = JSON.parse(decoder.decode(response.body));
        }
        catch (e) {
            result = e;
        }
        logger === null || logger === void 0 ? void 0 : logger.end();
        return result;
    });
};
exports.runProvisioningScript = runProvisioningScript;
