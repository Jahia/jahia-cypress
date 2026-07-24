"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getElement = getElement;
exports.getComponentBySelector = getComponentBySelector;
exports.getComponent = getComponent;
exports.getComponentByIndex = getComponentByIndex;
exports.getComponentByRole = getComponentByRole;
exports.getComponentByAttr = getComponentByAttr;
exports.getComponentByContent = getComponentByContent;
function getElement(selector, parent, assertion) {
    var chainable = parent ? parent.get().find(selector) : cy.get(selector);
    if (assertion) {
        return chainable.should(assertion);
    }
    return chainable;
}
function getComponentBySelector(C, selector, parent, assertion) {
    return new C(getElement(selector, parent, assertion), assertion);
}
function getComponent(C, parent, assertion) {
    return getComponentBySelector(C, C.defaultSelector, parent, assertion);
}
function getComponentByIndex(C, i, parent, assertion) {
    return getComponentBySelector(C, "".concat(C.defaultSelector, ":nth-child(").concat(i, ")"), parent, assertion);
}
function getComponentByRole(C, role, parent, assertion) {
    return getComponentBySelector(C, "".concat(C.defaultSelector, "[data-sel-role=\"").concat(role, "\"]"), parent, assertion);
}
// eslint-disable-next-line max-params
function getComponentByAttr(C, attr, value, parent, assertion) {
    return getComponentBySelector(C, "".concat(C.defaultSelector, "[").concat(attr, "=\"").concat(value, "\"]"), parent, assertion);
}
function getComponentByContent(C, content, parent, assertion) {
    var chainable = getElement(C.defaultSelector, parent).should('contains', content).contains(content);
    if (assertion) {
        chainable = chainable.should(assertion);
    }
    return new C(chainable, assertion);
}
