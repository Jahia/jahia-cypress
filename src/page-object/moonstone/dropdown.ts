import {BaseComponent, getByRole} from "../baseComponent"
import {Menu} from "./menu";


export class Dropdown extends BaseComponent {
    static defaultSelector = '.moonstone-dropdown_container'

    static getByRole(role: string, parent?: BaseComponent, assertion?: (s: JQuery) => void): Dropdown {
        return getByRole(Dropdown, role, parent, assertion)
    }

    select(item: string): Dropdown {
        this.get().click()
        Menu.get(this).select(item)
        return this
    }

}

