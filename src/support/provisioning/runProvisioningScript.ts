import RequestOptions = Cypress.RequestOptions;

// Load type definitions that come with Cypress module
/// <reference types="cypress" />

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Chainable<Subject> {
            runProvisioningScript(params: RunProvisioningScriptParams): Chainable<unknown>;
        }
    }
}

export interface RunProvisioningScriptParams {
    script: FormFile | StringDictionary[];
    files?: FormFile[];
    /** Optional, defaults to serverDefaults */
    jahiaServer?: JahiaServer;
    options?: Cypress.Loggable; // Optional, defaults to { log: true }
    requestOptions?: Partial<RequestOptions>; // Optional, defaults to {}
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
    // If the file has an encoding, create a Blob with the new Blob constructor. It handle correctly the encoding
    // for the groovy scripts
    // Did not change for all files because jar files can be added as well, which are binary files
    // In that case the function binaryStringToBlob will be used
    if (formFile.encoding) {
        return new Blob([content], {type: formFile.type});
    }

    // Default to binary string to blob conversion
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
    return Boolean((script as FormFile)?.fileContent || (script as FormFile)?.fileName);
}

function getScriptSummary(script: FormFile | StringDictionary[]): string {
    if (isFormFile(script)) {
        if (script.fileName) {
            return script.fileName;
        }

        if (script.fileContent) {
            // Parse first operation and its value from YAML list: "- operationName: value"
            const yamlMatch = script.fileContent.match(/^\s*-\s+(\w+)\s*:\s*"?([^"\n]+)"?/m);
            if (yamlMatch) {
                return `${yamlMatch[1]}: ${yamlMatch[2].trim()}`;
            }

            // Parse first operation name from JSON array: [{"operationName": ...}]
            try {
                const parsed = JSON.parse(script.fileContent);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const ops = parsed.map((op: Record<string, string>) => Object.keys(op)[0] ?? 'unknown');
                    return ops.length === 1 ? ops[0] : `[${ops.join(', ')}]`;
                }
            } catch {
                // Not valid JSON, fall through
            }
        }

        return 'inline script';
    }

    if (!script || script.length === 0) {
        return 'empty script';
    }

    const ops = script.map(op => Object.keys(op)[0] ?? 'unknown');
    return ops.length === 1 ? ops[0] : `[${ops.join(', ')}]`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const runProvisioningScript = (paramsOrScript: RunProvisioningScriptParams | FormFile | StringDictionary[], ...rest: any[]): void => {
    // Backward-compatible: support old positional signature
    // runProvisioningScript(script, files, jahiaServer, options, timeout)
    let script: FormFile | StringDictionary[];
    let files: FormFile[];
    let jahiaServer: JahiaServer;
    let options: Cypress.Loggable;
    let requestOptions: Partial<Cypress.RequestOptions>;

    const isLegacyCall = Array.isArray(paramsOrScript) ||
        (paramsOrScript as FormFile).fileContent !== undefined ||
        (paramsOrScript as FormFile).fileName !== undefined;

    if (isLegacyCall) {
        script = paramsOrScript as FormFile | StringDictionary[];
        files = rest[0];
        jahiaServer = rest[1] ?? serverDefaults;
        options = rest[2] ?? {log: true};
        requestOptions = {};
    } else {
        const params = paramsOrScript as RunProvisioningScriptParams;
        script = params.script;
        files = params.files;
        jahiaServer = params.jahiaServer ?? serverDefaults;
        options = params.options ?? {log: true};
        requestOptions = params.requestOptions ?? {};
    }

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

    const scriptSummary = getScriptSummary(script);
    const replacementsFromFiles = files
        ?.filter(f => f.replacements && Object.keys(f.replacements).length > 0)
        .map(f => `${f.fileName}: ${JSON.stringify(f.replacements)}`);

    if (options.log) {
        logger = Cypress.log({
            autoEnd: false,
            name: 'runProvisioningScript',
            displayName: 'provScript',
            message: `${scriptSummary} @ ${jahiaServer.url}`,
            consoleProps: () => {
                return {
                    Script: script,
                    Operations: isFormFile(script) ?
                        undefined :
                        script?.map(op => `${Object.keys(op)[0]}: ${Object.values(op)[0]}`),
                    Files: files?.map(f => f.fileName ?? 'inline file') ?? [],
                    Replacements: replacementsFromFiles?.length > 0 ? replacementsFromFiles : undefined,
                    Server: jahiaServer.url,
                    'HTTP Status': response ? `${response.status} ${response.statusText}` : 'pending',
                    Duration: response ? `${response.duration}ms` : 'pending',
                    Result: result,
                    Response: response
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

    cy.request(request).then(res => {
        response = res;

        // If the response status is 200, decode the response, otherwise return the response as is
        if (res.status === 200) {
            try {
                const decoder = new TextDecoder();
                result = JSON.parse(decoder.decode(response.body));
            } catch (e) {
                result = e;
            }
        } else {
            result = res;
        }

        logger?.end();
        if (logger) {
            const hasFailed = res.status !== 200 ||
                (Array.isArray(result) && result.some((r: any) => typeof r === 'string' && r.includes('.failed')));
            const prefix = hasFailed ? '❌ ' : '✅ ';
            logger.set('message', `${prefix}${scriptSummary} @ ${jahiaServer.url}`);
        }

        return result;
    });
};

