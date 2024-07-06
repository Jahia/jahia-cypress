"use strict";
// Load type definitions that come with Cypress module <reference types="cypress" />
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.repeatUntil = void 0;
var defaultOptions = {
    attempts: 10,
    callback: function () { return cy.reload({ log: false }); },
    delay: 1000
};
var repeatUntil = function (selector, options) {
    if (options === void 0) { options = {}; }
    options = __assign(__assign({}, defaultOptions), options);
    var log = Cypress.log({
        name: 'repeatUntil',
        message: "Reload until " + selector + ", remaining attempts : " + options.attempts,
        consoleProps: function () {
            return {
                attempts: options.attempts
            };
        }
    });
    var items = Cypress.$(selector);
    if (items.length) {
        log.set({ $el: items });
        cy.wrap(items, { log: false });
        return;
    }
    if (options.attempts > 1) {
        log.end();
        options.callback();
        cy.wait(options.delay);
        cy.repeatUntil(selector, __assign(__assign({}, options), { attempts: options.attempts - 1 }));
    }
    else {
        var err = Error('Items not found.');
        log.error(err);
        throw err;
    }
};
exports.repeatUntil = repeatUntil;
