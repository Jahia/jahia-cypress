import {apollo, apolloClient} from './apollo';
import {executeGroovy, runProvisioningScript, installModule, installAndStartModule, uninstallModule} from './provisioning';
import {login, loginAndStoreSession} from './login';
import {logout} from './logout';
import {fixture} from './fixture';
import {repeatUntil} from './repeatUntil';
import {step} from './testStep';
import {jfaker} from './jfaker';
import {modSince} from './modSince';
import {collect as contextCollector} from './reportingContext';

export const registerSupport = (): void => {
    Cypress.Commands.add('apolloClient', apolloClient);
    Cypress.Commands.add('apollo', {prevSubject: 'optional'}, apollo);

    Cypress.Commands.add('runProvisioningScript', runProvisioningScript);
    Cypress.Commands.add('executeGroovy', executeGroovy);
    Cypress.Commands.add('installModule', installModule);
    Cypress.Commands.add('installAndStartModule', installAndStartModule);
    Cypress.Commands.add('uninstallModule', uninstallModule);

    Cypress.Commands.add('login', login);
    Cypress.Commands.add('loginAndStoreSession', loginAndStoreSession);
    Cypress.Commands.add('logout', logout);
    Cypress.Commands.add('repeatUntil', repeatUntil);

    Cypress.Commands.overwrite('fixture', fixture);

    Cypress.Commands.add('step', step);

    // Register it.since()/describe.since()
    modSince.enable();

    /**
     * Override Cypress `type()` command to interpret special characters (e.g., {, }, etc.) either literally or as commands.
     * The behavior is controlled by the `parseSpecialCharSequences` option, which can be set to `true`
     * to enable command parsing or `false` to treat special characters as literal input.
     *
     * Since Cypress `clear()` command is an alias for `.type('{selectall}{del}')`,
     * such case has to be handled to ensure that the special character sequences are properly interpreted when clearing the input.
     * Also cover older Cypress versions which were using {backspace} was used instead of {del} .
     */
    Cypress.Commands.overwrite<'type', 'element'>(
        'type',
        (originalFn, element, text: string, options: Partial<Cypress.TypeOptions> = {}) => {
            // Check if this is Cypress `.clear() call
            const isCypressClearSequence = ['{selectall}{del}', '{selectall}{backspace}'].includes(text.toString());

            // Do not override if this is `.clear()` call or data type is `faker`
            const parseSpecialCharSequences = isCypressClearSequence || jfaker.getDataType() === 'faker';

            // Merge options with passed ones (if any)
            const newOptions: Partial<Cypress.TypeOptions> = {parseSpecialCharSequences, ...options};
            return originalFn(element, text, newOptions);
        }
    );

    /**
     * Listen to the 'test:after:run' event to collect tags and other context information after each test execution.
     */
    Cypress.on('test:after:run', (test, runnable) => {
        contextCollector(test, runnable);
    });
};
