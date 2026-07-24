"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apolloClient = exports.switchApolloClient = void 0;
var core_1 = require("@apollo/client/core");
var links_1 = require("./links");
var switchApolloClient = function (config, options) {
    if (config === void 0) { config = {}; }
    if (options === void 0) { options = {
        log: true,
        setCurrentApolloClient: true
    }; }
    // Switch context to apollo client
    cy.visit(config.url || Cypress.config().baseUrl, { failOnStatusCode: false });
    return (0, exports.apolloClient)(config, options);
};
exports.switchApolloClient = switchApolloClient;
var apolloClient = function (config, options) {
    if (config === void 0) { config = {}; }
    if (options === void 0) { options = {
        log: true,
        setCurrentApolloClient: true
    }; }
    var headers = {};
    if (config.token !== undefined) {
        headers.authorization = "APIToken ".concat(config.token);
    }
    else if (config.username !== undefined && config.password !== undefined) {
        headers.authorization = "Basic ".concat(btoa(config.username + ':' + config.password));
    }
    else {
        headers.authorization = "Basic ".concat(btoa('root:' + Cypress.env('SUPER_USER_PASSWORD')));
    }
    var links = [links_1.uploadLink, (0, links_1.formDataHttpLink)(config.url || Cypress.config().baseUrl, headers)];
    var client = new core_1.ApolloClient({
        link: (0, core_1.from)(links),
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
                    Config: config,
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
