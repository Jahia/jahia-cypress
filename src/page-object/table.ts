import {BaseComponent} from "./baseComponent"
import {Menu} from "./menu"

export class Table extends BaseComponent {
    constructor(selector = '.moonstone-Table', parent?: BaseComponent) {
        super(selector, parent)
    }

    getRow(i: number): TableRow {
        return new TableRow(`.moonstone-TableBody .moonstone-TableRow:nth-child(${i})`, this)
    }
}

export class TableRow extends BaseComponent {
    constructor(selector: string, parent?: BaseComponent) {
        super(selector, parent)
    }

    contextMenu(): Menu {
        this.get().rightclick()
        return new Menu('#menuHolder .moonstone-menu:not(.moonstone-hidden)')
    }

}