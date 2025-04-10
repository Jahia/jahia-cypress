import {JahiaServer} from '../support';

// eslint-disable-next-line default-param-last
export const createSite = (siteKey: string, config: {languages?: string, templateSet: string, serverName: string, locale: string} = {templateSet: 'dx-base-demo-templates', serverName: 'localhost', locale: 'en'}, jahiaServer?: JahiaServer): void => {
    cy.executeGroovy('groovy/admin/createSite.groovy', {
        SITEKEY: siteKey,
        TEMPLATES_SET: config.templateSet,
        SERVERNAME: config.serverName,
        LOCALE: config.locale,
        LANGUAGES: config.languages || config.locale
    }, jahiaServer);
};

export const deleteSite = (siteKey: string, jahiaServer?: JahiaServer): void => {
    cy.executeGroovy('groovy/admin/deleteSite.groovy', {
        SITEKEY: siteKey
    }, jahiaServer);
};

export const enableModule = (moduleName: string, siteKey: string, jahiaServer?: JahiaServer): void => {
    cy.runProvisioningScript({
        script: {
            fileContent: '- enable: "' + moduleName + '"\n  site: "' + siteKey + '"',
            type: 'application/yaml'
        },
        jahiaServer
    });
};

export const disableModule = (moduleName: string, siteKey: string): void => {
    cy.apollo({
        mutationFile: 'graphql/jcr/mutation/disableModule.graphql',
        variables: {moduleName, pathOrId: `/sites/${siteKey}`}
    });
};

// eslint-disable-next-line default-param-last
export const editSite = (siteKey: string, config: {serverName: string} = {serverName: 'localhost'}, jahiaServer?: JahiaServer): void => {
    cy.executeGroovy('groovy/admin/editSite.groovy', {
        SITEKEY: siteKey,
        SERVERNAME: config.serverName
    }, jahiaServer);
};
