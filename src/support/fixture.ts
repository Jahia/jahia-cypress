export const fixture = function(originalCommand, fixture, ...args) {
    cy.wrap({}, {log:false}).then(() => {
        return originalCommand(fixture, ...args).then(f => {
            return f
        }).catch((err) => {
            console.log(err)
            return null;
        });
    }).then(file => {
        if (!file) {
            let encoding;
            if (typeof args[0] === 'string') {
                encoding = args[0]
            }

            cy.readFile('./node_modules/@jahia/cypress/fixtures/' + fixture, encoding, {log:false, timeout:0})
        }
    })
};
