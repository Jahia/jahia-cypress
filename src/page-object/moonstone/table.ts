import {BaseComponent, get, getByContent, getElement} from "../baseComponent"
import {Menu} from "./menu"

export class Table extends BaseComponent {
    static defaultSelector = '.moonstone-Table'

    static get(parent?: BaseComponent, assertion?: (s: JQuery) => void): Table {
        return get(Table, parent, assertion)
    }

    getRows(assertion?: (s: JQuery) => void): TableRow {
        return TableRow.get(this, assertion)
    }

    getRowByIndex(i: number, assertion?: (s: JQuery) => void): TableRow {
        return TableRow.getByIndex(this, i, assertion)
    }

    getRowByContent(content: string, assertion?: (s: JQuery) => void): TableRow {
        return TableRow.getByContent(this, content, assertion)
    }
}

export class TableRow extends BaseComponent {
    static defaultSelector = '.moonstone-TableBody .moonstone-TableRow'

    static get(parent: Table, assertion?: (s: JQuery) => void): TableRow {
        return get(TableRow, parent, assertion)
    }

    static getByIndex(parent: Table, i: number, assertion?: (s: JQuery) => void): TableRow {
        return new TableRow(getElement(`${this.defaultSelector}:nth-child(${i})`, parent, assertion))
    }

    static getByContent(parent: Table, content: string, assertion?: (s: JQuery) => void): TableRow {
        return getByContent(TableRow, content, parent, assertion)
    }

    contextMenu(): Menu {
        this.get().rightclick()
        return new Menu(getElement('#menuHolder .moonstone-menu:not(.moonstone-hidden)'))
    }

}