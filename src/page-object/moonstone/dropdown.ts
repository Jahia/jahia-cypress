import {BaseComponent} from '../baseComponent';
import {Menu} from './menu';
import {getComponent} from '../utils';

export class Dropdown extends BaseComponent {
    static defaultSelector = '.moonstone-dropdown_container';

    select(item: string): Dropdown {
        this.get().click();
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(500);
        getComponent(Menu, this).select(item);
        return this;
    }
}

