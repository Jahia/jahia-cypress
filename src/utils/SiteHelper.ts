
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


// Exports a site from the server.
// - `serverUrl` (string): The URL of the server.
// - `siteToExport` (string): The key of the site to export.
// - `exportFile` (string, optional): The name of the export file.
// - `exportPath` (string, optional): The path where the exported site will be saved.
// --In the case of a folder export The exported site will be stored in /var/jahia/exports/${exportPath} on your jahia server.
// --In the case of a export as zip file, the exported zip will be stored in ${exportPath}/${exportFile}
// - `isFolderExport` (boolean, optional): Indicates whether the export is a folder export to the server or a local export of the site as a zip file.

export const exportSite = (serverUrl: string, siteToExport : string, exportFile = 'export.zip', exportPath = '', isFolderExport = false): void => {
    let exportUrl = `${serverUrl}/cms/export/default/${exportFile}?exportformat=site&live=true&sitebox=${siteToExport}`;
    if (isFolderExport ) {
        exportUrl = `${exportUrl}&exportPath=${exportPath}`;
        cy.request(exportUrl);
    } else {
        cy.request({method: 'GET', url: exportUrl, encoding: 'binary'})
            .then(response => {
                cy.writeFile(`${exportPath}/${exportFile}`, response.body, 'binary');
            });
    }
};

export const importSite = (serverUrl: string, pathToImportFolder : string, exportFile = 'export.zip', exportPath = ''): void => {
    const importParameters = `importsInfos%5B%27roles.zip%27%5D.selected=true
    &_importsInfos%5B%27roles.zip%27%5D.selected=&importsInfos%5B%27users.zip%27%5D.selected=true
    &_importsInfos%5B%27users.zip%27%5D.selected=&importsInfos%5B%27
    seoSiteToExporTest.zip%27%5D.selected=true&_importsInfos%5B%27seoSiteToExporTest.zip
    %27%5D.selected=&importsInfos%5B%27seoSiteToExporTest.zip
    %27%5D.siteTitle=seoSiteToExporTest&importsInfos%5B%27seoSiteToExporTest.zip%27%5D.siteKey=seoSiteToExporTest&importsInfos%5B%27seoSiteToExporTest.zip%27%5D.siteServername=localhost&importsInfos%5B%27seoSiteToExporTest.zip%27%5D.siteServernameAliases=&importsInfos%5B%27seoSiteToExporTest.zip%27%5D.templates=dx-base-demo-templates&_eventId_processImport=`;

    // Let exportUrl = `${serverUrl}/cms/export/default/${exportFile}?exportformat=site&live=true&sitebox=${siteToExport}`;
    // if (exportPath !== '') {
    //   exportUrl = `${exportUrl}&exportPath=${exportPath}`;
    // }

    // cy.request(exportUrl);
};
