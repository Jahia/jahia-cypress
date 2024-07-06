"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.BaseComponent = void 0;
var BaseComponent = /** @class */ (function () {
    function BaseComponent(element, assertion) {
        var _this = this;
        this.should = function (arg) {
            var _a;
            var others = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                others[_i - 1] = arguments[_i];
            }
            return (_a = cy.get('@component' + _this.id, { log: false })).should.apply(_a, __spreadArray([arg], others));
        };
        this.id = BaseComponent.count++;
        this.element = element.as('component' + this.id);
        this.assertion = assertion;
    }
    BaseComponent.prototype.get = function () {
        if (this.assertion) {
            return cy.get('@component' + this.id, { log: false }).should(this.assertion);
        }
        return cy.get('@component' + this.id, { log: false });
    };
    BaseComponent.defaultSelector = '';
    BaseComponent.count = 0;
    return BaseComponent;
}());
exports.BaseComponent = BaseComponent;
