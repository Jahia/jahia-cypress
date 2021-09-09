import {BaseComponent} from "../baseComponent"
import Chainable = Cypress.Chainable;

export class PrimaryNav extends BaseComponent {
    constructor() {
        super('.moonstone-primaryNav')
    }

    click(itemName: string): void {
        this.get().find(`.moonstone-primaryNavItem[role="${itemName}"]`).click()
    }

    listItems(): Chainable<string[]> {
        return this.get().find('.moonstone-primaryNavItem').then(items => {
            return Array.prototype.slice.call(items, 0).map(i => i.attributes['role'] ? i.attributes['role'].value : null).filter(i => i !== null)
        })
    }
}