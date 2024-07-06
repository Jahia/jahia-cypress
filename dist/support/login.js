"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */
exports.__esModule = true;
exports.loginAndStoreSession = exports.login = void 0;
/// <reference types="cypress" />
var login = function (username, password) {
    if (username === void 0) { username = 'root'; }
    if (password === void 0) { password = Cypress.env('SUPER_USER_PASSWORD'); }
    Cypress.log({
        name: 'login',
        message: "Login with " + username,
        consoleProps: function () {
            return {
                User: username
            };
        }
    });
    cy.request({
        method: 'POST',
        url: '/cms/login',
        form: true,
        body: { username: username, password: password },
        followRedirect: false,
        log: false
    }).then(function (res) {
        expect(res.status, 'Login result').to.eq(302);
    });
};
exports.login = login;
var loginAndStoreSession = function (username, password) {
    if (username === void 0) { username = 'root'; }
    if (password === void 0) { password = Cypress.env('SUPER_USER_PASSWORD'); }
    cy.session('session-' + username, function () {
        cy.login(username, password); // Edit in chief
    }, {
        validate: function () {
            cy.request('/start').its('status').should('eq', 200);
        }
    });
};
exports.loginAndStoreSession = loginAndStoreSession;
