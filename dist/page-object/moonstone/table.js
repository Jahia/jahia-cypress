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
exports.TableRow = exports.Table = void 0;
var baseComponent_1 = require("../baseComponent");
var menu_1 = require("./menu");
var utils_1 = require("../utils");
var Table = /** @class */ (function (_super) {
    __extends(Table, _super);
    function Table() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Table.prototype.getRows = function (assertion) {
        return utils_1.getComponent(TableRow, this, assertion);
    };
    Table.prototype.getRowByIndex = function (i, assertion) {
        return utils_1.getComponentByIndex(TableRow, i, this, assertion);
    };
    Table.prototype.getRowByContent = function (content, assertion) {
        return utils_1.getComponentByContent(TableRow, content, this, assertion);
    };
    Table.defaultSelector = '.moonstone-Table';
    return Table;
}(baseComponent_1.BaseComponent));
exports.Table = Table;
var TableRow = /** @class */ (function (_super) {
    __extends(TableRow, _super);
    function TableRow() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TableRow.prototype.contextMenu = function () {
        this.get().rightclick();
        return utils_1.getComponentBySelector(menu_1.Menu, '#menuHolder .moonstone-menu:not(.moonstone-hidden)');
    };
    TableRow.defaultSelector = '.moonstone-TableBody .moonstone-TableRow';
    return TableRow;
}(baseComponent_1.BaseComponent));
exports.TableRow = TableRow;
