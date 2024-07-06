import { BaseComponent } from '../baseComponent';
export declare class Menu extends BaseComponent {
    static defaultSelector: string;
    submenu(item: string, menu: string): Menu;
    shouldHaveItem(item: string): void;
    shouldNotHaveItem(item: string): void;
    select(item: string): Menu;
    selectByRole(item: string): Menu;
}
