import env from "./env"
import installLogsPrinter from 'cypress-terminal-report/src/installLogsPrinter'

export const registerPlugins = (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions): void => {
    env(on, config)
    installLogsPrinter(on)
}
