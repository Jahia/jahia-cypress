
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

export const editServerName = (siteKey: string, serverName: string): void => {
    cy.executeGroovy('groovy/admin/editSiteServerName.groovy', {
        SITEKEY: siteKey,
        SERVERNAME: serverName
    });
};
