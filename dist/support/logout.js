"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */
exports.__esModule = true;
exports.logout = void 0;
/// <reference types="cypress" />
var logout = function () {
    Cypress.log({
        name: 'logout',
        message: 'Logout',
        consoleProps: function () {
            return {};
        }
    });
    cy.request({
        method: 'POST',
        url: '/cms/logout',
        followRedirect: false,
        log: false
    }).then(function (res) {
        expect(res.status, 'Logout result').to.eq(302);
    });
};
exports.logout = logout;
