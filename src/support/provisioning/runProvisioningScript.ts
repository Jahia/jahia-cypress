/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */

// Load type definitions that come with Cypress module
/// <reference types="cypress" />



declare global {
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Chainable<Subject> {
            runProvisioningScript(script: FormFile, files?: FormFile[]): Chainable<any>
        }
    }
}

type FormFile = {
    fileName?: string,
    fileContent?: string,
    type?: string
}

function getBlob(formFile: FormFile): Promise<Blob> {
    return new Promise(resolve => {
        if (formFile.fileContent) {
            resolve(new Blob([formFile.fileContent], {type: formFile.type}))
        } else {
            cy.fixture(formFile.fileName, 'binary').then(content => {
                formFile.fileContent = content
                resolve(Cypress.Blob.binaryStringToBlob(content, formFile.type))
            })
        }
    })
}

export const runProvisioningScript = (script: FormFile, files?: FormFile[], options: Cypress.Loggable = {log:true}): void => {
    const formData = new FormData()

    getBlob(script).then(blob => formData.append("script", blob))
    files.forEach((f) => {
        getBlob(f).then(blob => {
            formData.append("file", blob, f.fileName)
        })
    })

    let response: Cypress.Response<any>
    let result: any
    let logger: Cypress.Log

    if (options.log) {
        logger = Cypress.log({
            autoEnd: false,
            name: 'runProvisioningScript',
            displayName: 'provScript',
            message: `Run ${script.fileName ? script.fileName : 'inline script'}`,
            consoleProps: () => {
                return {
                    Script: script,
                    Files: files,
                    Response: response,
                    Yielded: result
                }
            },
        })
    }

    cy.request({
        url: `${Cypress.config().baseUrl}/modules/api/provisioning`,
        method: 'POST',
        auth: {
            user: 'root',
            pass: Cypress.env('SUPER_USER_PASSWORD'),
            sendImmediately: true,
        },
        body: formData,
        log: false
    }).then(res => {
        response = res
        expect(res.status, 'Script result').to.eq(200)
        const decoder = new TextDecoder()
        result = JSON.parse(decoder.decode(response.body))
        logger?.end()
        return result
    })
}

