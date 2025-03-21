import {BaseComponent} from '../baseComponent';
import {getComponentByRole} from '../utils';
import Chainable = Cypress.Chainable;

export class Menu extends BaseComponent {
    static defaultSelector = '.moonstone-menu:not(.moonstone-hidden)'
    static overlaySelector = '.moonstone-menu_overlay';

    submenu(item: string, menu: string): Menu {
        this.shouldHaveItem(item);
        this.get().find('.moonstone-menuItem').contains(item).realHover();
        return getComponentByRole(Menu, menu);
    }

    shouldHaveItem(item: string):void {
        this.get().find('.moonstone-menuItem').contains(item).scrollIntoView();
        this.get().find('.moonstone-menuItem').contains(item).should('be.visible');
    }

    shouldHaveRoleItem(role: string):void {
        this.get().find(`.moonstone-menuItem[data-sel-role="${role}"]`).scrollIntoView();
        this.get().find(`.moonstone-menuItem[data-sel-role="${role}"]`).should('be.visible');
    }

    shouldNotHaveItem(item: string):void {
        this.get().find('.moonstone-menuItem').contains(item).should('not.exist');
    }

    shouldNotHaveRoleItem(role: string):void {
        this.get().find(`.moonstone-menuItem[data-sel-role="${role}"]`).should('not.exist');
    }

    select(item: string): Menu {
        this.shouldHaveItem(item);
        this.get().find('.moonstone-menuItem').contains(item).trigger('click');
        return this;
    }

    selectByRole(role: string): Menu {
        this.shouldHaveRoleItem(role);
        this.get().find(`.moonstone-menuItem[data-sel-role="${role}"]`).trigger('click');
        return this;
    }

    /** Can be used for choicelist dropdown menu */
    selectByValue(value: string): Menu {
        this.get().find(`.moonstone-menuItem[data-value="${value}"]`).scrollIntoView();
        this.get().find(`.moonstone-menuItem[data-value="${value}"]`).should('be.visible');
        this.get().find(`.moonstone-menuItem[data-value="${value}"]`).trigger('click');
        return this;
    }

    close(): Chainable<unknown> {
        return cy.get(Menu.overlaySelector).click('topRight');
    }
}
