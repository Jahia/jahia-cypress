import { BaseComponent } from '../baseComponent';
import Chainable = Cypress.Chainable;
export declare class Menu extends BaseComponent {
    static defaultSelector: string;
    static overlaySelector: string;
    submenu(item: string, menu: string): Menu;
    shouldHaveItem(item: string): void;
    shouldHaveRoleItem(role: string): void;
    shouldNotHaveItem(item: string): void;
    shouldNotHaveRoleItem(role: string): void;
    select(item: string): Menu;
    selectByRole(role: string): Menu;
    /** Can be used for choicelist dropdown menu */
    selectByValue(value: string): Menu;
    close(): Chainable<unknown>;
}
