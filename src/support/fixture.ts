import Chainable = Cypress.Chainable;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fixture = function (originalCommand: ((...args: any[]) => any), fixtureParam: string, ...args: any[]): Chainable<any> {
    return cy.wrap({}, {log: false}).then(() => {
        return originalCommand(fixtureParam, ...args).then(f => {
            return f;
        }).catch(() => {
            return null;
        });
    }).then(file => {
        if (!file) {
            let encoding;
            if (typeof args[0] === 'string') {
                encoding = args[0];
            }

            try {
                cy.readFile('./node_modules/@jahia/cypress/fixtures/' + fixtureParam, encoding, {log: false, timeout: 500});
            } catch (e) {
                console.log(e);
            }
        }
    });
};
