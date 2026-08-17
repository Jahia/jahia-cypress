import Chainable = Cypress.Chainable;

const PACKAGED_FIXTURES_PATH = './node_modules/@jahia/cypress/fixtures/';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fixture = function (originalCommand: ((...args: any[]) => any), fixtureParam: string, ...args: any[]): Chainable<any> {
    return cy.wrap({}, {log: false}).then(() => {
        return originalCommand(fixtureParam, ...args).then(f => {
            return f;
        }).catch(() => {
            return null;
        });
    }).then(file => {
        if (file) {
            return file;
        }

        let encoding;
        if (typeof args[0] === 'string') {
            encoding = args[0];
        }

        // The project has no fixture of that name, so read the copy shipped with this library.
        // This read takes the project's defaultCommandTimeout: a private budget of a few hundred
        // milliseconds made it the first command to fail on a loaded machine, which turned a slow
        // disk into a failed test. A failure here is not caught on purpose. cy.readFile() queues a
        // command instead of running inline, so a try/catch around it never sees the error, and a
        // fixture the caller cannot read is a failure in every case.
        return cy.readFile(PACKAGED_FIXTURES_PATH + fixtureParam, encoding, {log: false});
    });
};
