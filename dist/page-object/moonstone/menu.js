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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Menu = void 0;
var baseComponent_1 = require("../baseComponent");
var utils_1 = require("../utils");
var Menu = /** @class */ (function (_super) {
    __extends(Menu, _super);
    function Menu() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Menu.prototype.submenu = function (item, menu) {
        this.shouldHaveItem(item);
        this.get().find('.moonstone-menuItem').contains(item).realHover();
        return (0, utils_1.getComponentByRole)(Menu, menu);
    };
    Menu.prototype.shouldHaveItem = function (item) {
        this.get().find('.moonstone-menuItem').contains(item).scrollIntoView();
        this.get().find('.moonstone-menuItem').contains(item).should('be.visible');
    };
    Menu.prototype.shouldHaveRoleItem = function (role) {
        this.get().find(".moonstone-menuItem[data-sel-role=\"".concat(role, "\"]")).scrollIntoView();
        this.get().find(".moonstone-menuItem[data-sel-role=\"".concat(role, "\"]")).should('be.visible');
    };
    Menu.prototype.shouldNotHaveItem = function (item) {
        this.get().find('.moonstone-menuItem').contains(item).should('not.exist');
    };
    Menu.prototype.shouldNotHaveRoleItem = function (role) {
        this.get().find(".moonstone-menuItem[data-sel-role=\"".concat(role, "\"]")).should('not.exist');
    };
    Menu.prototype.select = function (item) {
        this.shouldHaveItem(item);
        this.get().find('.moonstone-menuItem').contains(item).trigger('click');
        return this;
    };
    Menu.prototype.selectByRole = function (role) {
        this.shouldHaveRoleItem(role);
        this.get().find(".moonstone-menuItem[data-sel-role=\"".concat(role, "\"]")).trigger('click');
        return this;
    };
    /** Can be used for choicelist dropdown menu */
    Menu.prototype.selectByValue = function (value) {
        this.get().find(".moonstone-menuItem[data-value=\"".concat(value, "\"]")).scrollIntoView();
        this.get().find(".moonstone-menuItem[data-value=\"".concat(value, "\"]")).should('be.visible');
        this.get().find(".moonstone-menuItem[data-value=\"".concat(value, "\"]")).trigger('click');
        return this;
    };
    Menu.prototype.close = function () {
        return cy.get(Menu.overlaySelector).click('topRight');
    };
    Menu.defaultSelector = '.moonstone-menu:not(.moonstone-hidden)';
    Menu.overlaySelector = '.moonstone-menu_overlay';
    return Menu;
}(baseComponent_1.BaseComponent));
exports.Menu = Menu;
