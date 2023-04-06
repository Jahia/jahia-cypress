const env = (on:Cypress.PluginEvents, config: Cypress.PluginConfigOptions):Cypress.PluginConfigOptions => {
    if (!process.env.JAHIA_URL && !process.env.SUPER_USER_PASSWORD) {
        console.warn('No environment set, will use default values');
        config.baseUrl = 'http://localhost:8080';
        config.env.JAHIA_URL = 'http://localhost:8080';
        config.env.SUPER_USER_PASSWORD = 'root1234';
    } else {
        console.log('Setting environment');
        config.baseUrl = process.env.JAHIA_URL;
        config.env.JAHIA_URL = process.env.JAHIA_URL;
        config.env.SUPER_USER_PASSWORD = process.env.SUPER_USER_PASSWORD;
    }

    console.log('JAHIA_URL =', config.env.JAHIA_URL);
    console.log('SUPER_USER_PASSWORD =', config.env.SUPER_USER_PASSWORD);

    return config;
};

export default env;
