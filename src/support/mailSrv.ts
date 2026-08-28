/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * mailSrv - A thin wrapper around cypress-mailpit adding an SMTP/API availability check.
 *
 * Importing this module registers the `cy.mailpit*` commands exposed by cypress-mailpit
 * (https://github.com/pushpak1300/cypress-mailpit).
 *
 * `mailSrv.ready()` is specific to this wrapper: it checks that the Mailpit server
 * (and its underlying storage) is up, using Mailpit's own `/readyz` healthcheck endpoint.
 *
 * Every other call is delegated to the corresponding `cy.mailpit*` command, with the
 * `mailpit` prefix dropped and the following letter lower-cased,
 * e.g. `mailSrv.getAllMails()` calls `cy.mailpitGetAllMails()`.
 *
 * Mailpit connection settings (`MAILPIT_URL`, `MAILPIT_USERNAME`, `MAILPIT_PASSWORD`) are
 * configured the same way as for cypress-mailpit itself, via `Cypress.env(...)`.
 *
 * @see https://github.com/pushpak1300/cypress-mailpit#commands for the full list of available commands
 * @example
 * ```typescript
 * mailSrv.ready().should('be.true');
 * mailSrv.sendMail({subject: 'Hello'});
 * mailSrv.hasEmailsBySubject('Hello');
 * ```
 */
import 'cypress-mailpit';

const ENV_MAILPIT_URL = 'MAILPIT_URL';
const DEFAULT_MAILPIT_URL = 'http://localhost:8025';
const MAILPIT_COMMAND_PREFIX = 'mailpit';

// Property names that must never be resolved to a mailpit command, so that the mailService proxy
// is never mistaken for a thenable/iterable/etc. by Cypress or generic JS utilities inspecting it.
const RESERVED_PROPS = new Set(['then', 'toJSON', 'constructor', 'nodeType']);

/**
 * Resolve the configured Mailpit base URL, falling back to the local default.
 * @returns {string} Mailpit base URL, e.g. "http://localhost:8025"
 */
function getMailpitUrl(): string {
    return Cypress.env(ENV_MAILPIT_URL) ?? DEFAULT_MAILPIT_URL;
}

/**
 * Check whether the Mailpit server is up and ready to accept requests (SMTP + API + storage),
 * using Mailpit's own `/readyz` healthcheck endpoint, which requires no authentication.
 * @param {Partial<Cypress.RequestOptions>} options Options merged into the underlying `cy.request()` call, e.g. `{timeout: 5000}`
 * @returns {Cypress.Chainable<boolean>} true if Mailpit responded ready, false otherwise
 */
function ready(options: Partial<Cypress.RequestOptions> = {}): Cypress.Chainable<boolean> {
    return cy
        .request({
            method: 'GET',
            url: `${getMailpitUrl()}/readyz`,
            failOnStatusCode: false,
            ...options
        })
        .then(response => response.status === 200);
}

/**
 * Convert a mailService method name into the corresponding cypress-mailpit command name,
 * e.g. "getAllMails" -> "mailpitGetAllMails".
 * @param {string} method mailService method name
 * @returns {string} cypress-mailpit command name
 */
function toMailpitCommand(method: string): string {
    return `${MAILPIT_COMMAND_PREFIX}${method.charAt(0).toUpperCase()}${method.slice(1)}`;
}

/**
 * Dynamic Proxy delegating any call other than `ready()` to the corresponding
 * `cy.mailpit*` command registered by cypress-mailpit.
 */
const mailSrv = new Proxy({ready} as Record<string, unknown>, {
    get(target, prop) {
        if (typeof prop !== 'string' || RESERVED_PROPS.has(prop) || prop in target) {
            return Reflect.get(target, prop);
        }

        const commandName = toMailpitCommand(prop);
        if (typeof (cy as any)[commandName] !== 'function') {
            throw new Error(`[mailSrv EXCEPTION] cypress-mailpit does not provide a "${commandName}" command.`);
        }

        return (...args: unknown[]) => (cy as any)[commandName](...args);
    }
}) as any;

export {mailSrv};
