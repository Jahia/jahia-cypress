import Chainable = Cypress.Chainable;

export type ComponentType<Component> = { new(p: Chainable<JQuery>, assertion?: (s: JQuery) => void): Component, defaultSelector: string };

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