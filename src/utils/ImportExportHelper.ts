// Utility methods to call import/export Jahia API

// http://localhost:8080/cms/export/default/export.zip?exportformat=site&live=true&users=true&path=/groups&path=/settings/mail-server-1&sitebox=digitall&exportPath=abc
// Export

import RequestOptions = Cypress.RequestOptions;
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

const request = (workspace: string, nodePath: string, exportFormat: string, params: string, jahiaServer: JahiaServer): Partial<RequestOptions> => ({
    url: `${jahiaServer.url}${API_NAME}/${workspace}${nodePath}.${exportFormat}?${params}`,

    method: 'GET',
    auth: {
        user: jahiaServer.username,
        pass: jahiaServer.password,
        sendImmediately: true
    },
    log: false
});

const serverDefaults: JahiaServer = {
    url: Cypress.config().baseUrl,
    username: 'root',
    password: Cypress.env('SUPER_USER_PASSWORD')
};

export const exportContent = (workspace: string, nodePath: string, exportFormat: string, exportParams: ExportParameters = {
    exportformat: 'site',
    live: true,
    users: true
}, jahiaServer: JahiaServer = serverDefaults): void => {
    const params = Object.keys(exportParams)
        .filter(key => !['paths', 'sitebox'].includes(key))
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(exportParams[key])}`) || [];

    const sitebox: string[] = exportParams.sitebox?.map(sb => `sitebox=${encodeURIComponent(sb)}`) || [];
    const paths: string[] = exportParams.paths?.map(path => `path=${encodeURIComponent(path)}`) || [];
    cy.request(request(workspace, nodePath, exportFormat, [...paths, ...sitebox, ...params].join('&'), jahiaServer)).then(res => res);
};
