import env from './env';

export const registerPlugins = (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions): void => {
    env(on, config);
};
