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
exports.Accordion = void 0;
var baseComponent_1 = require("../baseComponent");
var Accordion = /** @class */ (function (_super) {
    __extends(Accordion, _super);
    function Accordion() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Accordion.prototype.click = function (itemName) {
        this.get().find("section.moonstone-accordionItem header[aria-controls=\"" + itemName + "\"]").click();
        return this;
    };
    Accordion.prototype.listItems = function () {
        return this.get().find('section.moonstone-accordionItem header').then(function (items) {
            return Array.prototype.slice.call(items, 0).map(function (i) { return i.attributes['aria-controls'] ? i.attributes['aria-controls'].value : null; }).filter(function (i) { return i !== null; });
        });
    };
    Accordion.prototype.getContent = function () {
        return this.get().find('section.moonstone-accordionItem .moonstone-accordionItem_content');
    };
    Accordion.defaultSelector = '.moonstone-accordion';
    return Accordion;
}(baseComponent_1.BaseComponent));
exports.Accordion = Accordion;
