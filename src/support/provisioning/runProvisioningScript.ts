import RequestOptions = Cypress.RequestOptions;

// Load type definitions that come with Cypress module
/// <reference types="cypress" />

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Chainable<Subject> {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            runProvisioningScript(script: FormFile | StringDictionary[], files?: FormFile[], jahiaServer?: JahiaServer): Chainable<any>
        }
    }
}

export type StringDictionary = { [key: string]: string }

export type FormFile = {
    fileName?: string,
    fileContent?: string,
    type?: string,
    encoding?: Cypress.Encodings
    replacements?: StringDictionary
}

export type JahiaServer = {
    url: string;
    username: string;
    password: string
}

function processContent(formFile: FormFile) {
    let content = formFile.fileContent;
    if (formFile.replacements) {
        Object.keys(formFile.replacements).forEach(k => {
            content = content.replaceAll(k, formFile.replacements[k]);
        });
    }

    formFile.fileContent = content;
    return Cypress.Blob.binaryStringToBlob(content, formFile.type);
}

function append(formFile: FormFile, formData: FormData, key: string) {
    if (formFile.fileContent) {
        formData.append(key, processContent(formFile), formFile.fileName);
    } else if (formFile.fileName) {
        cy.fixture(formFile.fileName, (formFile.encoding ? formFile.encoding : 'binary')).then(content => {
            if (typeof content === 'object') {
                formFile.fileContent = JSON.stringify(content);
            } else {
                formFile.fileContent = content;
            }

            formData.append(key, processContent(formFile), formFile.fileName);
        });
    }
}

const serverDefaults: JahiaServer = {
    url: Cypress.config().baseUrl,
    username: 'root',
    password: Cypress.env('SUPER_USER_PASSWORD')
};

function isFormFile(script: FormFile | StringDictionary[]): script is FormFile {
    return Boolean((script as FormFile).fileContent || (script as FormFile).fileName);
}

// eslint-disable-next-line default-param-last, max-params
export const runProvisioningScript = (script: FormFile | StringDictionary[], files?: FormFile[], jahiaServer: JahiaServer = serverDefaults, options: Cypress.Loggable = {log: true}, timeout?: number, requestOptions: Partial<RequestOptions> = {}): void => {
    const formData = new FormData();

    if (isFormFile(script)) {
        append(script, formData, 'script');
    } else {
        append({
            fileContent: JSON.stringify(script),
            type: 'application/json'
        }, formData, 'script');
    }

    if (files) {
        files.forEach(f => {
            append(f, formData, 'file');
        });
    }

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    let response: Cypress.Response<any>;
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    let result: any;
    let logger: Cypress.Log;

    if (options.log) {
        logger = Cypress.log({
            autoEnd: false,
            name: 'runProvisioningScript',
            displayName: 'provScript',
            message: `Run ${isFormFile(script) && script.fileName ? script.fileName : 'inline script'} towards server: ${jahiaServer.url}`,
            consoleProps: () => {
                return {
                    Script: script,
                    Files: files,
                    Response: response,
                    Yielded: result
                };
            }
        });
    }

    const request: Partial<RequestOptions> = {
        url: `${jahiaServer.url}/modules/api/provisioning`,
        method: 'POST',
        auth: {
            user: jahiaServer.username,
            pass: jahiaServer.password,
            sendImmediately: true
        },
        body: formData,
        log: false,
        ...requestOptions
    };

    if (typeof timeout !== 'undefined') {
        request.timeout = timeout;
    }

    cy.request(request).then(res => {
        response = res;
        expect(res.status, 'Script result').to.eq(200);
        try {
            const decoder = new TextDecoder();
            result = JSON.parse(decoder.decode(response.body));
        } catch (e) {
            result = e;
        }

        logger?.end();
        return result;
    });
};

