import {apollo, apolloClient} from './apollo';
import {executeGroovy, runProvisioningScript, installBundle} from './provisioning';
import {login, loginAndStoreSession} from './login';
import {logout} from './logout';
import {fixture} from './fixture';
import {repeatUntil} from './repeatUntil';

export const registerSupport = (): void => {
    Cypress.Commands.add('apolloClient', apolloClient);
    Cypress.Commands.add('apollo', {prevSubject: 'optional'}, apollo);

    Cypress.Commands.add('runProvisioningScript', runProvisioningScript);
    Cypress.Commands.add('executeGroovy', executeGroovy);
    Cypress.Commands.add('installBundle', installBundle);

    Cypress.Commands.add('login', login);
    Cypress.Commands.add('loginAndStoreSession', loginAndStoreSession);
    Cypress.Commands.add('logout', logout);
    Cypress.Commands.add('repeatUntil', repeatUntil);

    Cypress.Commands.overwrite('fixture', fixture);
};
