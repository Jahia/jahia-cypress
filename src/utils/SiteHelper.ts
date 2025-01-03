
export const createSite = (siteKey: string, config: {languages?: string, templateSet: string, serverName: string, locale: string} = {templateSet: 'dx-base-demo-templates', serverName: 'localhost', locale: 'en'}): void => {
    cy.executeGroovy('groovy/admin/createSite.groovy', {
        SITEKEY: siteKey,
        TEMPLATES_SET: config.templateSet,
        SERVERNAME: config.serverName,
        LOCALE: config.locale,
        LANGUAGES: config.languages || config.locale
    });
};

export const deleteSite = (siteKey: string): void => {
    cy.executeGroovy('groovy/admin/deleteSite.groovy', {
        SITEKEY: siteKey
    });
};

export const enableModule = (moduleName: string, siteKey: string): void => {
    cy.runProvisioningScript({
        fileContent: '- enable: "' + moduleName + '"\n  site: "' + siteKey + '"',
        type: 'application/yaml'
    });
};

export const disableModule = (moduleName: string, siteKey: string): void => {
    cy.apollo({
        mutationFile: 'graphql/jcr/mutation/disableModule.graphql',
        variables: {moduleName, pathOrId: `/sites/${siteKey}`}
    });
};

export const editSite = (siteKey: string, config: {serverName: string} = {serverName: 'localhost'}): void => {
    cy.executeGroovy('groovy/admin/editSite.groovy', {
        SITEKEY: siteKey,
        SERVERNAME: config.serverName
    });
};

export const exportSite = (serverUrl: string, siteToExport : string, exportFile = 'export.zip', exportPath = ''): void => {
    let exportUrl = `${serverUrl}/cms/export/default/${exportFile}?exportformat=site&live=true&sitebox=${siteToExport}`;
    if (exportPath !== '') {
        exportUrl = `${exportUrl}&exportPath=${exportPath}`;
    }

    cy.request(exportUrl);
};

