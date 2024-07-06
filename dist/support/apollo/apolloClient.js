"use strict";
exports.__esModule = true;
exports.apolloClient = void 0;
var core_1 = require("@apollo/client/core");
var links_1 = require("./links");
var apolloClient = function (authMethod, options) {
    if (authMethod === void 0) { authMethod = { url: Cypress.config().baseUrl }; }
    if (options === void 0) { options = {
        log: true,
        setCurrentApolloClient: true
    }; }
    var headers = {};
    if (authMethod.token !== undefined) {
        headers.authorization = "APIToken " + authMethod.token;
    }
    else if (authMethod.username !== undefined && authMethod.password !== undefined) {
        headers.authorization = "Basic " + btoa(authMethod.username + ':' + authMethod.password);
    }
    else {
        headers.authorization = "Basic " + btoa('root:' + Cypress.env('SUPER_USER_PASSWORD'));
    }
    var links = [links_1.uploadLink, links_1.formDataHttpLink(authMethod.url, headers)];
    var client = new core_1.ApolloClient({
        link: core_1.from(links),
        cache: new core_1.InMemoryCache(),
        defaultOptions: {
            query: {
                fetchPolicy: 'no-cache'
            }
        }
    });
    if (options.log) {
        Cypress.log({
            name: 'apolloClient',
            displayName: 'apClient',
            message: 'Create new apollo client',
            consoleProps: function () {
                return {
                    Auth: authMethod,
                    Yielded: client
                };
            }
        });
    }
    if (options.setCurrentApolloClient) {
        cy.wrap(client, { log: false }).as('currentApolloClient');
    }
    else {
        cy.wrap(client, { log: false });
    }
};
exports.apolloClient = apolloClient;
