import {BaseComponent} from "./baseComponent"

export class Menu extends BaseComponent {
    constructor(selector: string, parent?: BaseComponent) {
        super(selector, parent)
    }

    select(item: string): void {
        cy.get(this.selector).find(`.moonstone-menuItem[data-sel-role="${item}"]`).trigger('click')
    }
}