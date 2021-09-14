import Chainable = Cypress.Chainable;

export function getElement(selector: string, parent?: BaseComponent, assertion?: (s: JQuery) => void): Chainable<JQuery> {
    const chainable = parent ? parent.get().find(selector) : cy.get(selector);
    if (assertion) {
        return chainable.should(assertion)
    }
    return chainable;
}

export function get<Component extends BaseComponent>(C: { new(p: Chainable<JQuery>, assertion?: (s: JQuery) => void): Component, defaultSelector: string }, parent?: BaseComponent, assertion?: (s: JQuery) => void): Component {
    return new C(getElement(C.defaultSelector, parent, assertion), assertion)
}

export function getByRole<Component extends BaseComponent>(C: { new(p: Chainable<JQuery>, assertion?: (s: JQuery) => void): Component, defaultSelector: string }, role: string, parent?: BaseComponent, assertion?: (s: JQuery) => void): Component {
    return new C(getElement(`${C.defaultSelector}[data-sel-role="${role}"]`, parent, assertion), assertion)
}

export function getByContent<Component extends BaseComponent>(c: { new(p: Chainable<JQuery>, assertion?: (s: JQuery) => void): Component, defaultSelector: string }, content: string, parent?: BaseComponent, assertion?: (s: JQuery) => void): Component {
    let chainable = getElement(c.defaultSelector, parent).should('contains', content).contains(content);
    if (assertion) {
        chainable = chainable.should(assertion)
    }
    return new c(chainable, assertion)
}

export class BaseComponent {
    static count = 0

    element: Chainable<JQuery>
    id: number
    assertion?: (s: JQuery) => void

    constructor(element: Chainable<JQuery>, assertion?: (s: JQuery) => void) {
        this.id = BaseComponent.count++
        this.element = element.as('component' + this.id)
        this.assertion = assertion
    }

    get(): Chainable<JQuery> {
        if (this.assertion) {
            return cy.get('@component' + this.id, {log: false}).should(this.assertion)
        }

        return cy.get('@component' + this.id, {log: false})
    }
}