"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.step = void 0;
var step = function (message, func) {
    cy.then(function () {
        // @ts-ignore
        Cypress.log({ groupStart: true, displayName: '[ STEP ]', message: "".concat(message) });
    }).then(function () {
        func();
    }).then(function () {
        // @ts-ignore
        Cypress.log({ groupEnd: true, emitOnly: true });
    });
};
exports.step = step;
