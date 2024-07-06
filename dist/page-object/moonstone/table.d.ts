/// <reference types="cypress" />
import { BaseComponent } from '../baseComponent';
import { Menu } from './menu';
export declare class Table extends BaseComponent {
    static defaultSelector: string;
    getRows(assertion?: (s: JQuery) => void): TableRow;
    getRowByIndex(i: number, assertion?: (s: JQuery) => void): TableRow;
    getRowByContent(content: string, assertion?: (s: JQuery) => void): TableRow;
}
export declare class TableRow extends BaseComponent {
    static defaultSelector: string;
    contextMenu(): Menu;
}
