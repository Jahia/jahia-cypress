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
exports.Collapsible = void 0;
var baseComponent_1 = require("../baseComponent");
var Collapsible = /** @class */ (function (_super) {
    __extends(Collapsible, _super);
    function Collapsible() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Collapsible.prototype.collapse = function () {
        var _this = this;
        this.get().children('div').then(function ($child) {
            if ($child.hasClass('moonstone-collapsible_content_expanded')) {
                _this.get().find('.moonstone-collapsible_button').click();
            }
        });
        return this;
    };
    Collapsible.prototype.expand = function () {
        var _this = this;
        this.get().children('div').then(function ($child) {
            if ($child.hasClass('moonstone-collapsible_content_collapsed')) {
                _this.get().find('.moonstone-collapsible_button').click().scrollIntoView();
            }
        });
        return this;
    };
    Collapsible.prototype.shouldBeCollapsed = function () {
        this.get().find('.moonstone-collapsible_content_collapsed').should('exist');
    };
    Collapsible.prototype.shouldBeExpanded = function () {
        this.get().find('.moonstone-collapsible_content_expanded').should('exist');
    };
    Collapsible.defaultSelector = '.moonstone-collapsible';
    return Collapsible;
}(baseComponent_1.BaseComponent));
exports.Collapsible = Collapsible;
