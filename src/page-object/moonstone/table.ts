import {BaseComponent} from "../baseComponent"
import {Menu} from "./menu"

export class Table extends BaseComponent {
    constructor(selector = '') {
        super(selector + '.moonstone-Table')
    }

    getRow(i: number): TableRow {
        return new TableRow(`${this.selector} .moonstone-TableBody .moonstone-TableRow:nth-child(${i})`)
    }
}

export class TableRow extends BaseComponent {
    constructor(selector: string) {
        super(selector)
    }

    contextMenu(): Menu {
        this.get().rightclick()
        return new Menu('#menuHolder .moonstone-menu:not(.moonstone-hidden)')
    }

}