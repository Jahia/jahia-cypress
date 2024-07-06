"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.Dropdown = void 0;
var baseComponent_1 = require("../baseComponent");
var menu_1 = require("./menu");
var utils_1 = require("../utils");
var Dropdown = /** @class */ (function (_super) {
    __extends(Dropdown, _super);
    function Dropdown() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Dropdown.prototype.select = function (item) {
        this.get().click();
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(500);
        utils_1.getComponent(menu_1.Menu, this).select(item);
        return this;
    };
    Dropdown.defaultSelector = '.moonstone-dropdown_container';
    return Dropdown;
}(baseComponent_1.BaseComponent));
exports.Dropdown = Dropdown;
