import { BaseComponent } from '../baseComponent';
import Chainable = Cypress.Chainable;
export declare class PrimaryNav extends BaseComponent {
    static defaultSelector: string;
    click(itemName: string): void;
    listItems(): Chainable<string[]>;
}
