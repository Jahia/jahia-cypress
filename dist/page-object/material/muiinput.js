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
exports.MUIInput = void 0;
var baseComponent_1 = require("../baseComponent");
var MUIInput = /** @class */ (function (_super) {
    __extends(MUIInput, _super);
    function MUIInput() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MUIInput.prototype.clear = function () {
        this.get().clear();
        return this;
    };
    MUIInput.prototype.type = function (text, options) {
        this.get().type(text, options);
        return this;
    };
    MUIInput.defaultSelector = 'div';
    return MUIInput;
}(baseComponent_1.BaseComponent));
exports.MUIInput = MUIInput;
