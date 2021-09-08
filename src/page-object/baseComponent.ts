import Chainable = Cypress.Chainable;

export class BaseComponent {
    static count = 0

    element: Chainable<JQuery>
    id: number
    selector: string

    constructor(selector: string, parent?: BaseComponent) {
        this.id = BaseComponent.count++
        this.selector = (parent ? parent.selector + ' ' : '') + selector

        if (parent) {
            this.element = parent.get().get(selector).as('component' + this.id)
        } else {
            this.element = cy.get(selector).as('component' + this.id)
        }
    }

    get(): Chainable<JQuery> {
        return cy.get('@component' + this.id, {log: false})
    }
}