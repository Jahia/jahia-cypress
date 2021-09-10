import {apollo, apolloClient} from "./apollo"
import {executeGroovy, runProvisioningScript} from "./provisioning"
import {login} from "./login"
import {logout} from "./logout"
import installLogsCollector from 'cypress-terminal-report/src/installLogsCollector'
import {fixture} from "./fixture";

export const registerSupport = (): void => {
    Cypress.Commands.add('apolloClient', apolloClient)
    Cypress.Commands.add('apollo', {prevSubject: 'optional'}, apollo)

    Cypress.Commands.add('runProvisioningScript', runProvisioningScript)
    Cypress.Commands.add('executeGroovy', executeGroovy)

    Cypress.Commands.add('login', login)
    Cypress.Commands.add('logout', logout)

    Cypress.Commands.overwrite('fixture', fixture)

    installLogsCollector()
}