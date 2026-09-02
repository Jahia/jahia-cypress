import env from './env';
import {registerGlobalVarsTasks} from './globalVars';

export const registerPlugins = (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions): void => {
    env(on, config);
    registerGlobalVarsTasks(on);
};
