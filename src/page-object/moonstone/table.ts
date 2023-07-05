import {BaseComponent} from '../baseComponent';
import {Menu} from './menu';
import {getComponent, getComponentByContent, getComponentByIndex, getComponentBySelector} from '../utils';

export class Table extends BaseComponent {
    static defaultSelector = '.moonstone-Table'

    getRows(assertion?: (s: JQuery) => void): TableRow {
        return getComponent(TableRow, this, assertion);
    }

    getRowByIndex(i: number, assertion?: (s: JQuery) => void): TableRow {
        return getComponentByIndex(TableRow, i, this, assertion);
    }

    getRowByContent(content: string, assertion?: (s: JQuery) => void): TableRow {
        return getComponentByContent(TableRow, content, this, assertion);
    }
}

export class TableRow extends BaseComponent {
    static defaultSelector = '.moonstone-TableBody .moonstone-TableRow'

    contextMenu(): Menu {
        this.get().rightclick();
        return getComponentBySelector(Menu, '#menuHolder .moonstone-menu:not(.moonstone-hidden)');
    }
}
