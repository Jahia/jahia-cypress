"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.fixture = void 0;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var fixture = function (originalCommand, fixtureParam) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    return cy.wrap({}, { log: false }).then(function () {
        return originalCommand.apply(void 0, __spreadArray([fixtureParam], args)).then(function (f) {
            return f;
        })["catch"](function () {
            return null;
        });
    }).then(function (file) {
        if (!file) {
            var encoding = void 0;
            if (typeof args[0] === 'string') {
                encoding = args[0];
            }
            try {
                cy.readFile('./node_modules/@jahia/cypress/fixtures/' + fixtureParam, encoding, { log: false, timeout: 2000 });
            }
            catch (e) {
                console.log(e);
            }
        }
    });
};
exports.fixture = fixture;
