import { BaseComponent } from '../baseComponent';
import Chainable = Cypress.Chainable;
export declare class Pagination extends BaseComponent {
    static defaultSelector: string;
    clickNextPage(): Pagination;
    clickPreviousPage(): Pagination;
    getTotalRows(): Chainable<number>;
}
