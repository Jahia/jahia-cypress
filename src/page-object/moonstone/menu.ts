import {BaseComponent} from '../baseComponent';
import {getComponentByRole} from '../utils';

export class Menu extends BaseComponent {
    static defaultSelector = '.moonstone-menu:not(.moonstone-hidden)'

    submenu(item: string, menu: string): Menu {
        this.get().find('.moonstone-menuItem').contains(item).scrollIntoView().should('be.visible');
        this.get().find('.moonstone-menuItem').contains(item).realHover();
        return getComponentByRole(Menu, menu);
    }

    shouldHaveItem(item: string):void {
        this.get().find('.moonstone-menuItem').contains(item).scrollIntoView().should('be.visible');
    }

    shouldNotHaveItem(item: string):void {
        this.get().find('.moonstone-menuItem').contains(item).should('not.exist');
    }

    select(item: string): Menu {
        this.get().find('.moonstone-menuItem').contains(item).scrollIntoView().should('be.visible');
        this.get().find('.moonstone-menuItem').contains(item).trigger('click');
        return this;
    }

    selectByRole(item: string): Menu {
        this.get().find(`.moonstone-menuItem[data-sel-role="${item}"]`).scrollIntoView().should('be.visible');
        this.get().find(`.moonstone-menuItem[data-sel-role="${item}"]`).trigger('click');
        return this;
    }
}
