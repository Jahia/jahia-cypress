/// <reference types="cypress" />
import { BaseComponent } from '../baseComponent';
import Chainable = Cypress.Chainable;
export declare class IFrame extends BaseComponent {
    static defaultSelector: string;
    private body;
    constructor(element: Chainable<JQuery>, assertion?: (s: JQuery) => void);
    getBody(): Chainable<JQuery>;
    enter(): void;
}
