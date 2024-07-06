/// <reference types="cypress" />
import Chainable = Cypress.Chainable;
import Chainer = Cypress.Chainer;
export declare type ComponentType<Component> = {
    new (p: Chainable<JQuery>, assertion?: (s: JQuery) => void): Component;
    defaultSelector: string;
};
export declare class BaseComponent {
    static defaultSelector: string;
    static count: number;
    element: Chainable<JQuery>;
    id: number;
    assertion?: (s: JQuery) => void;
    constructor(element: Chainable<JQuery>, assertion?: (s: JQuery) => void);
    get(): Chainable<JQuery>;
    should: Chainer<JQuery>;
}
