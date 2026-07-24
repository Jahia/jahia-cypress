"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginAndStoreSession = exports.login = void 0;
/// <reference types="cypress" />
// Disable linter to keep as this for backward compatibility
// eslint-disable-next-line default-param-last
var login = function (username, password, config) {
    var _a;
    if (username === void 0) { username = 'root'; }
    if (password === void 0) { password = Cypress.env('SUPER_USER_PASSWORD'); }
    Cypress.log({
        name: 'login',
        message: "Login with ".concat(username),
        consoleProps: function () {
            return {
                User: username
            };
        }
    });
    var body = { username: username, password: password };
    var url = '/cms/login';
    if (typeof config === 'object') {
        if (config.rememberMe) {
            body.useCookie = 'on';
        }
        url = (_a = config.url) !== null && _a !== void 0 ? _a : url;
    }
    else {
        url = config !== null && config !== void 0 ? config : url;
    }
    cy.request({
        method: 'POST',
        form: true,
        body: body,
        followRedirect: false,
        log: false,
        url: url
    }).then(function (res) {
        expect(res.status, 'Login result').to.eq(302);
    });
};
exports.login = login;
var loginAndStoreSession = function (username, password, url) {
    if (username === void 0) { username = 'root'; }
    if (password === void 0) { password = Cypress.env('SUPER_USER_PASSWORD'); }
    if (url === void 0) { url = '/start'; }
    cy.session('session-' + username, function () {
        cy.login(username, password); // Edit in chief
    }, {
        validate: function () {
            cy.request(url).its('status').should('eq', 200);
        }
    });
};
exports.loginAndStoreSession = loginAndStoreSession;
