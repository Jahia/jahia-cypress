import {BaseComponent} from '../baseComponent';
import {Menu} from './menu';
import {getComponent} from '../utils';

export class Dropdown extends BaseComponent {
    static defaultSelector = '.moonstone-dropdown_container'

    select(item: string): Dropdown {
        this.get().click();
        getComponent(Menu, null, $el => expect($el).to.be.visible).select(item);
        return this;
    }
}

