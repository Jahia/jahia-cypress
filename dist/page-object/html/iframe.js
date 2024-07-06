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
exports.IFrame = void 0;
var baseComponent_1 = require("../baseComponent");
var IFrame = /** @class */ (function (_super) {
    __extends(IFrame, _super);
    function IFrame(element, assertion) {
        var _this = _super.call(this, element, assertion) || this;
        _this.get()
            .should(function (f) {
            var fr = f[0];
            expect(fr.contentWindow.location.href).not.equals('about:blank');
            expect(fr.contentWindow.document.readyState).equals('complete');
            // eslint-disable-next-line  no-unused-expressions
            expect(fr.contentDocument.body).not.be.empty;
        })
            .its('0.contentDocument.body').as('framebody' + _this.id);
        return _this;
    }
    IFrame.prototype.getBody = function () {
        return cy.get('@framebody' + this.id);
    };
    IFrame.prototype.enter = function () {
        this.get().then(function (f) {
            var fr = f[0];
            cy.visit(fr.contentWindow.location.href);
        });
    };
    IFrame.defaultSelector = 'iframe';
    return IFrame;
}(baseComponent_1.BaseComponent));
exports.IFrame = IFrame;
