import {apolloClient, apolloMutate, apolloQuery} from "./apollo"
import {executeGroovy, runProvisioningScript} from "./provisioning"
import {login} from "./login"
import {logout} from "./logout"
import installLogsCollector from 'cypress-terminal-report/src/installLogsCollector'

export const registerSupport = (): void => {
    Cypress.Commands.add('apolloClient', apolloClient)
    Cypress.Commands.add('apolloQuery', {prevSubject: 'optional'}, apolloQuery)
    Cypress.Commands.add('apolloMutate', {prevSubject: 'optional'}, apolloMutate)

    Cypress.Commands.add('runProvisioningScript', runProvisioningScript)
    Cypress.Commands.add('executeGroovy', executeGroovy)

    Cypress.Commands.add('login', login)
    Cypress.Commands.add('logout', logout)

    installLogsCollector()
}