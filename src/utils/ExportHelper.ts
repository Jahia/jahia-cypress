// Utility methods to call import/export Jahia API

// http://localhost:8080/cms/export/default/export.zip?exportformat=site&live=true&users=true&path=/groups&path=/settings/mail-server-1&sitebox=digitall&exportPath=abc
// Export

import {JahiaServer} from '../support';

const API_NAME = '/cms/export';

export type ExportParameters = {
    viewContent?: boolean;
    viewVersion?: boolean;
    viewAcl?: boolean;
    viewLinks?: boolean;
    viewMetadata?: boolean;
    viewWorkflow?: boolean;
    exportPath?: string;
    exportformat: 'all' | 'site' | 'xml' | 'zip';
    root?: string;
    live?: boolean;
    users?: boolean;
    sitebox?: string[];
    paths?: string[];
    cleanup?: 'template' | 'simple';
    filesToZip?: string;
}

const serverDefaults: JahiaServer = {
    url: Cypress.config().baseUrl,
    username: 'root',
    password: Cypress.env('SUPER_USER_PASSWORD')
};

type ExportContentParams = {
    workspace?: string;
    nodePath?: string;
    exportFormat?: string;
    params?: ExportParameters;
    jahiaServer?: JahiaServer;
}

export const exportContent = (
    {
        workspace = 'default',
        nodePath = '/export',
        exportFormat = 'zip',
        params = {
            exportformat: 'site',
            live: true,
            users: true
        },
        jahiaServer = serverDefaults
    }: ExportContentParams): void => {
    const queryStringParams = Object.keys(params)
        .filter(key => !['paths', 'sitebox'].includes(key))
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`) || [];

    const sitebox: string[] = params.sitebox?.map(sb => `sitebox=${encodeURIComponent(sb)}`) || [];
    const paths: string[] = params.paths?.map(path => `path=${encodeURIComponent(path)}`) || [];
    const qs = [...queryStringParams, ...sitebox, ...paths].join('&');
    // It is not possible to use the "qs" field of RequestOptions for querystring as it does not support multiple parameters with the same name (path or sitebox)
    cy.request({
        url: `${jahiaServer.url}${API_NAME}/${workspace}${nodePath}.${exportFormat}?${qs}`,
        method: 'GET',
        auth: {
            user: jahiaServer.username,
            pass: jahiaServer.password,
            sendImmediately: true
        }
    });
};

