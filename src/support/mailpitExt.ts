/**
 * Registers cypress-mailpit's `cy.mailpit*` commands and adds `cy.mailpitReady()`,
 * an SMTP/API availability check for Mailpit that cypress-mailpit doesn't provide itself.
 *
 * Every other `cy.mailpit*` command is used as-is, straight from cypress-mailpit
 * (https://github.com/pushpak1300/cypress-mailpit) — see its README for the full command list.
 *
 * Mailpit connection settings (`MAILPIT_URL`, `MAILPIT_USERNAME`, `MAILPIT_PASSWORD`) are
 * configured the same way as for cypress-mailpit itself, via `Cypress.env(...)`.
 *
 * @example
 * ```typescript
 * cy.mailpitReady().should('be.true');
 * cy.mailpitSendMail({subject: 'Hello'});
 * cy.mailpitHasEmailsBySubject('Hello');
 * ```
 */
import 'cypress-mailpit';

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
const ENV_SMTP_STATUS = 'JAHIA_SMTP_STATUS'; // 'configured' | 'absent' | undefined (unset)

type SmtpStatus = 'configured' | 'absent';
const SMTP_STATUS_CONFIGURED: SmtpStatus = 'configured';
const SMTP_STATUS_ABSENT: SmtpStatus = 'absent';

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

/**
 * Registers a root-level `before()` hook that points Jahia's SMTP settings at Mailpit, by
 * running `groovy/admin/setupSmtp.groovy`, once per run.
 *
 * `JAHIA_SMTP_STATUS` tracks multiple states rather than a plain boolean, so that a repo with
 * no Mailpit container only pays the `mailpitReady()` check once instead of on every spec:
 * absent/unset (not checked yet), `'configured'` (script ran), `'absent'` (Mailpit wasn't
 * reachable on the first check — skip without re-checking).
 */
export function setupSmtp(): void {
    before(() => {
        const status = Cypress.env(ENV_SMTP_STATUS) as SmtpStatus | undefined;
        if (status === SMTP_STATUS_CONFIGURED || status === SMTP_STATUS_ABSENT) {
            return;
        }

        mailpitReady().then(ready => {
            if (!ready) {
                cy.log('[setupSmtp] Mailpit not running, skipping SMTP configuration.');
                Cypress.env(ENV_SMTP_STATUS, SMTP_STATUS_ABSENT);
                return;
            }

            cy.executeGroovy('groovy/admin/setupSmtp.groovy');
            Cypress.env(ENV_SMTP_STATUS, SMTP_STATUS_CONFIGURED);
        });
    });
}
