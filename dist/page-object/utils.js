"use strict";
exports.__esModule = true;
exports.getComponentByContent = exports.getComponentByAttr = exports.getComponentByRole = exports.getComponentByIndex = exports.getComponent = exports.getComponentBySelector = exports.getElement = void 0;
function getElement(selector, parent, assertion) {
    var chainable = parent ? parent.get().find(selector) : cy.get(selector);
    if (assertion) {
        return chainable.should(assertion);
    }
    return chainable;
}
exports.getElement = getElement;
function getComponentBySelector(C, selector, parent, assertion) {
    return new C(getElement(selector, parent, assertion), assertion);
}
exports.getComponentBySelector = getComponentBySelector;
function getComponent(C, parent, assertion) {
    return getComponentBySelector(C, C.defaultSelector, parent, assertion);
}
exports.getComponent = getComponent;
function getComponentByIndex(C, i, parent, assertion) {
    return getComponentBySelector(C, C.defaultSelector + ":nth-child(" + i + ")", parent, assertion);
}
exports.getComponentByIndex = getComponentByIndex;
function getComponentByRole(C, role, parent, assertion) {
    return getComponentBySelector(C, C.defaultSelector + "[data-sel-role=\"" + role + "\"]", parent, assertion);
}
exports.getComponentByRole = getComponentByRole;
// eslint-disable-next-line max-params
function getComponentByAttr(C, attr, value, parent, assertion) {
    return getComponentBySelector(C, C.defaultSelector + "[" + attr + "=\"" + value + "\"]", parent, assertion);
}
exports.getComponentByAttr = getComponentByAttr;
function getComponentByContent(C, content, parent, assertion) {
    var chainable = getElement(C.defaultSelector, parent).should('contains', content).contains(content);
    if (assertion) {
        chainable = chainable.should(assertion);
    }
    return new C(chainable, assertion);
}
exports.getComponentByContent = getComponentByContent;
