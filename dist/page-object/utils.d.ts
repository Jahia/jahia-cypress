/// <reference types="cypress" />
import { Table } from './moonstone';
import { BaseComponent, ComponentType } from './baseComponent';
import Chainable = Cypress.Chainable;
export declare function getElement(selector: string, parent?: BaseComponent, assertion?: (s: JQuery) => void): Chainable<JQuery>;
export declare function getComponentBySelector<Component>(C: ComponentType<Component>, selector: string, parent?: BaseComponent, assertion?: (s: JQuery) => void): Component;
export declare function getComponent<Component>(C: ComponentType<Component>, parent?: BaseComponent, assertion?: (s: JQuery) => void): Component;
export declare function getComponentByIndex<Component>(C: ComponentType<Component>, i: number, parent: Table, assertion?: (s: JQuery) => void): Component;
export declare function getComponentByRole<Component>(C: ComponentType<Component>, role: string, parent?: BaseComponent, assertion?: (s: JQuery) => void): Component;
export declare function getComponentByAttr<Component>(C: ComponentType<Component>, attr: string, value: string, parent?: BaseComponent, assertion?: (s: JQuery) => void): Component;
export declare function getComponentByContent<Component>(C: ComponentType<Component>, content: string, parent?: BaseComponent, assertion?: (s: JQuery) => void): Component;
