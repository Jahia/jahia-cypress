import Chainable = Cypress.Chainable;

export class BaseComponent {
    static count = 0

    element: Chainable<JQuery>
    id: number
    selector: string

    constructor(selector: string) {
        this.id = BaseComponent.count++
        this.selector = selector + ' '
        this.element = cy.get(selector).as('component' + this.id)
    }

    getSelector(): string {
        return this.selector
    }

    get(): Chainable<JQuery> {
        return cy.get('@component' + this.id, {log: false})
    }
}