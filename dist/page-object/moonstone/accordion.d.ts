/// <reference types="cypress" />
import { BaseComponent } from '../baseComponent';
import Chainable = Cypress.Chainable;
export declare class Accordion extends BaseComponent {
    static defaultSelector: string;
    click(itemName: string): Accordion;
    listItems(): Chainable<string[]>;
    getContent(): Chainable<JQuery>;
}
