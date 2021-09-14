import {BaseComponent, get} from "../baseComponent"
import {Button} from "./button";
import Chainable = Cypress.Chainable;


export class Pagination extends BaseComponent {
    static defaultSelector = '.moonstone-tablePagination'

    static get(parent?: BaseComponent, assertion?: (s: JQuery) => void): Pagination {
        return get(Pagination, parent, assertion)
    }

    clickNextPage(): Pagination {
        Button.getByRole('table-pagination-button-next-page', this).click()
        return this
    }

    clickPreviousPage(): Pagination {
        Button.getByRole('table-pagination-button-previous-page', this).click()
        return this
    }

    getTotalRows(): Chainable<number> {
        return this.get().contains('of').then(el => Number.parseInt(el.text().substr(el.text().indexOf('of') +3)))
    }

}

