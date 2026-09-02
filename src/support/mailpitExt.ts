/**
 * Cypress support file that extends cypress-mailpit with additional commands.
 * Adds `cy.mailpitReady()` - an SMTP/API availability check for Mailpit that cypress-mailpit doesn't provide itself.
 *
 * Every other `cy.mailpit*` command is used as-is, straight from cypress-mail pit
 * (https://github.com/pushpak1300/cypress-mailpit) — see its README for the full command list.
 *
 * @example
 * ```typescript
 * cy.mailpitReady().should('be.true');
 * cy.mailpitSendMail({subject: 'Hello'});
 * cy.mailpitHasEmailsBySubject('Hello');
 * ```
 */

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {
            /**
             * Check whether the Mailpit server is up and ready to accept requests (SMTP + API + storage),
             * using Mailpit's own `/readyz` healthcheck endpoint, which requires no authentication.
             * @param {Partial<Cypress.RequestOptions>} options Options merged into the underlying `cy.request()` call, e.g. `{timeout: 5000}`
             */
            mailpitReady(options?: Partial<Cypress.RequestOptions>): Chainable<boolean>;
        }
    }
}

const ENV_MAILPIT_URL = 'MAILPIT_URL';
const DEFAULT_MAILPIT_URL = 'http://localhost:8025';

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
export function mailpitReady(options: Partial<Cypress.RequestOptions> = {}): Cypress.Chainable<boolean> {
    return cy
        .request({
            method: 'GET',
            url: `${getMailpitUrl()}/readyz`,
            failOnStatusCode: false,
            ...options
        })
        .then(response => {
            const result = response.status === 200;
            if (!result) {
                cy.log(`[mailpitReady] Mailpit not ready: ${response.status} ${response.statusText}. Ensure that Mailpit is running and reachable at ${getMailpitUrl()}.`);
            }

            return result;
        });
}
