import {BaseComponent} from '../baseComponent';

export class Menu extends BaseComponent {
    static defaultSelector = '.moonstone-menu:not(.moonstone-hidden)'

    select(item: string): Menu {
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(500);
        this.get().find('.moonstone-menuItem').should('contain', item).contains(item).trigger('click');
        return this;
    }

    selectByRole(item: string): Menu {
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(500);
        this.get().find(`.moonstone-menuItem[data-sel-role="${item}"]`).trigger('click');
        return this;
    }
}
