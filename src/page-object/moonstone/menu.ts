import {BaseComponent, get} from "../baseComponent"


export class Menu extends BaseComponent {
    static defaultSelector = '.moonstone-menu'

    static get(parent?: BaseComponent, assertion?: (s: JQuery) => void): Menu {
        return get(Menu, parent, assertion)
    }

    select(item: string): Menu {
        this.get().find(`.moonstone-menuItem`).should("contain", item).contains(item).trigger('click')
        return this
    }

    selectByRole(item: string): Menu {
        this.get().find(`.moonstone-menuItem[data-sel-role="${item}"]`).trigger('click')
        return this
    }
}