/// <reference types="cypress" />
import { BaseComponent } from '../baseComponent';
import TypeOptions = Cypress.TypeOptions;
export declare class MUIInput extends BaseComponent {
    static defaultSelector: string;
    clear(): MUIInput;
    type(text: string, options?: Partial<TypeOptions>): MUIInput;
}
