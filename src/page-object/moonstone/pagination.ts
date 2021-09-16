import {BaseComponent} from "../baseComponent"
import {Button} from "./button";
import Chainable = Cypress.Chainable;
import {getComponentByRole} from "../utils";

export class Pagination extends BaseComponent {
    static defaultSelector = '.moonstone-tablePagination'

    clickNextPage(): Pagination {
        getComponentByRole(Button, 'table-pagination-button-next-page', this).click()
        return this
    }

    clickPreviousPage(): Pagination {
        getComponentByRole(Button, 'table-pagination-button-previous-page', this).click()
        return this
    }

    getTotalRows(): Chainable<number> {
        return this.get().contains('of').then(el => Number.parseInt(el.text().substr(el.text().indexOf('of') +3)))
    }

}

