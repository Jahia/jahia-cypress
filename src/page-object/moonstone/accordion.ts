import {BaseComponent} from "../baseComponent"
import Chainable = Cypress.Chainable;

export class Accordion extends BaseComponent {
    constructor(selector = '') {
        super(selector + '.moonstone-accordion')
    }

    click(itemName: string): void {
        this.get().find(`section.moonstone-accordionItem header[aria-controls="${itemName}"]`).click()
    }

    listItems(): Chainable<string[]> {
        return this.get().find('section.moonstone-accordionItem header').then(items => {
            return Array.prototype.slice.call(items, 0).map(i => i.attributes['aria-controls'] ? i.attributes['aria-controls'].value : null).filter(i => i !== null)
        })
    }

    getContent(): Chainable<JQuery> {
        return this.get().find('section.moonstone-accordionItem .moonstone-accordionItem_content')
    }

}