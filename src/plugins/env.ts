const env = (on:Cypress.PluginEvents, config: Cypress.PluginConfigOptions):Cypress.PluginConfigOptions => {
    if (!process.env.JAHIA_URL && !process.env.SUPER_USER_PASSWORD) {
        console.warn('No environment set, will use default values');
        config.baseUrl = 'http://localhost:8080';
        config.env.JAHIA_URL = 'http://localhost:8080';
        config.env.JAHIA_PROCESSING_URL = 'http://localhost:8080';
        config.env.SUPER_USER_PASSWORD = 'root1234';
        config.env.MAILPIT_URL = 'http://localhost:8025';
    } else {
        console.log('Setting environment');
        config.baseUrl = process.env.JAHIA_URL;
        config.env.JAHIA_URL = process.env.JAHIA_URL;
        config.env.JAHIA_PROCESSING_URL = process.env.JAHIA_PROCESSING_URL;
        config.env.SUPER_USER_PASSWORD = process.env.SUPER_USER_PASSWORD;
        config.env.MAILPIT_URL = process.env.MAILPIT_URL;
    }

    console.log('JAHIA_URL =', config.env.JAHIA_URL);
    console.log('JAHIA_PROCESSING_URL =', config.env.JAHIA_PROCESSING_URL);
    console.log('SUPER_USER_PASSWORD =', config.env.SUPER_USER_PASSWORD);
    console.log('MAILPIT_URL =', config.env.MAILPIT_URL);

    return config;
};

export default env;
