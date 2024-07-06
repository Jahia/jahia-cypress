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
exports.Menu = void 0;
var baseComponent_1 = require("../baseComponent");
var utils_1 = require("../utils");
var Menu = /** @class */ (function (_super) {
    __extends(Menu, _super);
    function Menu() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Menu.prototype.submenu = function (item, menu) {
        this.get().find('.moonstone-menuItem').contains(item).scrollIntoView().should('be.visible');
        this.get().find('.moonstone-menuItem').contains(item).realHover();
        return utils_1.getComponentByRole(Menu, menu);
    };
    Menu.prototype.shouldHaveItem = function (item) {
        this.get().find('.moonstone-menuItem').contains(item).scrollIntoView().should('be.visible');
    };
    Menu.prototype.shouldNotHaveItem = function (item) {
        this.get().find('.moonstone-menuItem').contains(item).should('not.exist');
    };
    Menu.prototype.select = function (item) {
        this.get().find('.moonstone-menuItem').contains(item).scrollIntoView().should('be.visible');
        this.get().find('.moonstone-menuItem').contains(item).trigger('click');
        return this;
    };
    Menu.prototype.selectByRole = function (item) {
        this.get().find(".moonstone-menuItem[data-sel-role=\"" + item + "\"]").scrollIntoView().should('be.visible');
        this.get().find(".moonstone-menuItem[data-sel-role=\"" + item + "\"]").trigger('click');
        return this;
    };
    Menu.defaultSelector = '.moonstone-menu:not(.moonstone-hidden)';
    return Menu;
}(baseComponent_1.BaseComponent));
exports.Menu = Menu;
