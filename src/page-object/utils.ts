import {Table} from './moonstone';
import {BaseComponent, ComponentType} from './baseComponent';
import Chainable = Cypress.Chainable;

export function getElement(selector: string, parent?: BaseComponent, assertion?: (s: JQuery) => void): Chainable<JQuery> {
    const chainable = parent ? parent.get().find(selector) : cy.get(selector);
    if (assertion) {
        return chainable.should(assertion);
    }

    return chainable;
}

export function getComponentBySelector<Component>(C: ComponentType<Component>, selector: string, parent?: BaseComponent, assertion?: (s: JQuery) => void): Component {
    return new C(getElement(selector, parent, assertion), assertion);
}

export function getComponent<Component>(C: ComponentType<Component>, parent?: BaseComponent, assertion?: (s: JQuery) => void): Component {
    return getComponentBySelector(C, C.defaultSelector, parent, assertion);
}

export function getComponentByIndex<Component>(C: ComponentType<Component>, i: number, parent: Table, assertion?: (s: JQuery) => void): Component {
    return getComponentBySelector(C, `${C.defaultSelector}:nth-child(${i})`, parent, assertion);
}

export function getComponentByRole<Component >(C: ComponentType<Component>, role: string, parent?: BaseComponent, assertion?: (s: JQuery) => void): Component {
    return getComponentBySelector(C, `${C.defaultSelector}[data-sel-role="${role}"]`, parent, assertion);
}

// eslint-disable-next-line max-params
export function getComponentByAttr<Component>(C: ComponentType<Component>, attr: string, value: string, parent?: BaseComponent, assertion?: (s: JQuery) => void): Component {
    return getComponentBySelector(C, `${C.defaultSelector}[${attr}="${value}"]`, parent, assertion);
}

export function getComponentByContent<Component>(C: ComponentType<Component>, content: string, parent?: BaseComponent, assertion?: (s: JQuery) => void): Component {
    let chainable = getElement(C.defaultSelector, parent).should('contains', content).contains(content);
    if (assertion) {
        chainable = chainable.should(assertion);
    }

    return new C(chainable, assertion);
}
