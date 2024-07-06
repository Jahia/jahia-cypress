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
exports.Pagination = void 0;
var baseComponent_1 = require("../baseComponent");
var button_1 = require("./button");
var utils_1 = require("../utils");
var Pagination = /** @class */ (function (_super) {
    __extends(Pagination, _super);
    function Pagination() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Pagination.prototype.clickNextPage = function () {
        utils_1.getComponentByRole(button_1.Button, 'table-pagination-button-next-page', this).click();
        return this;
    };
    Pagination.prototype.clickPreviousPage = function () {
        utils_1.getComponentByRole(button_1.Button, 'table-pagination-button-previous-page', this).click();
        return this;
    };
    Pagination.prototype.getTotalRows = function () {
        // eslint-disable-next-line radix
        return this.get().contains('of').then(function (el) { return Number.parseInt(el.text().substr(el.text().indexOf('of') + 3)); });
    };
    Pagination.defaultSelector = '.moonstone-tablePagination';
    return Pagination;
}(baseComponent_1.BaseComponent));
exports.Pagination = Pagination;
