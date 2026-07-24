"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixture = void 0;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var fixture = function (originalCommand, fixtureParam) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    return cy.wrap({}, { log: false }).then(function () {
        return originalCommand.apply(void 0, __spreadArray([fixtureParam], args, false)).then(function (f) {
            return f;
        }).catch(function () {
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
