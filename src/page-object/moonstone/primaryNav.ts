import {BaseComponent, get} from "../baseComponent"
import Chainable = Cypress.Chainable;

export class PrimaryNav extends BaseComponent {
    static defaultSelector = '.moonstone-primaryNav'

    static get(parent?: BaseComponent, assertion?: (s: JQuery) => void): PrimaryNav {
        return get(PrimaryNav, parent, assertion)
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